const API_RATE_LIMIT_THRESHOLD = 10;

async function fetchAllRepositories(platform, username, page = 1, allRepos = []) {
    let apiUrl;
    if (platform === 'github') {
        apiUrl = `https://api.github.com/users/${username}/repos?type=public&per_page=100&page=${page}`;
    } else if (platform === 'gitlab') {
        const userResponse = await fetch(`https://gitlab.com/api/v4/users?username=${username}`);
        if (!userResponse.ok) {
            throw new Error(`Error fetching user data from GitLab: ${userResponse.statusText}`);
        }
        const users = await userResponse.json();
        if (users.length === 0) {
            throw new Error('User not found on GitLab.');
        }
        const userId = users[0].id;
        apiUrl = `https://gitlab.com/api/v4/users/${userId}/projects?per_page=100&page=${page}`;
    } else {
        throw new Error('Invalid platform selected.');
    }
    
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        let repos = await response.json();
        
        if (platform === 'gitlab') {
            repos = repos.filter(repo => repo.visibility === 'public');
        }
        
        const combinedRepos = [...allRepos, ...repos];
        
        if (repos.length === 100) {
            return fetchAllRepositories(platform, username, page + 1, combinedRepos);
        } else {
            return combinedRepos;
        }
    } catch (error) {
        throw error;
    }
}

async function checkApiRateLimit(platform) {
    let apiUrl;
    if (platform === 'github') {
        apiUrl = 'https://api.github.com/rate_limit';
    } else if (platform === 'gitlab') {
        return { remaining: Infinity };
    } else {
        throw new Error('Invalid platform selected.');
    }
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return { remaining: Infinity };
        }
        
        const rateData = await response.json();
        const remaining = rateData.resources.core.remaining;
        const resetTime = new Date(rateData.resources.core.reset * 1000);
        
        return { remaining, resetTime };
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return { remaining: Infinity };
    }
}

async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    const platform = document.getElementById('platform-select').value;
    
    if (!username) {
        showError('Please enter a username.');
        return;
    }
    
    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    const loadingEl = document.getElementById('loading');
    const clearButton = document.getElementById('clear-button');
    const searchContainer = document.getElementById('searchContainer');
    const downloadAllButton = document.getElementById('download-all-button');
    const errorContainer = document.getElementById('error-container');
    
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '';
    errorContainer.style.display = 'none';
    loadingEl.style.display = 'flex';
    searchContainer.style.display = 'none';
    downloadAllButton.style.display = 'none';
    
    try {
        const { remaining, resetTime } = await checkApiRateLimit(platform);
        
        if (platform === 'github' && remaining <= API_RATE_LIMIT_THRESHOLD) {
            throw new Error(`GitHub API rate limit is low (${remaining} remaining). Try again after ${resetTime.toLocaleTimeString()}.`);
        }
        
        let userData;
        if (platform === 'github') {
            const userResponse = await fetch(`https://api.github.com/users/${username}`);
            if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    throw new Error('User not found on GitHub. Please check the username and try again.');
                } else {
                    const errorData = await userResponse.json().catch(() => null);
                    throw new Error(errorData?.message || `Error ${userResponse.status}: ${userResponse.statusText}`);
                }
            }
            userData = await userResponse.json();
        } else if (platform === 'gitlab') {
            const userResponse = await fetch(`https://gitlab.com/api/v4/users?username=${username}`);
            if (!userResponse.ok) {
                throw new Error(`Error fetching user data from GitLab: ${userResponse.statusText}`);
            }
            const users = await userResponse.json();
            if (users.length === 0) {
                throw new Error('User not found on GitLab. Please check the username and try again.');
            }
            userData = users[0];
        }
        
        updateUserAvatar(userData.avatar_url || userData.avatar);
        
        const repos = await fetchAllRepositories(platform, username);
        
        loadingEl.style.display = 'none';
        
        if (repos.length === 0) {
            repoHeaderEl.innerHTML = `
                <h3>Repositories for ${username} on ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
                <span class="repo-count">0</span>
            `;
            repoListEl.innerHTML = '<p class="terminal-intro">No public repositories found.</p>';
            clearButton.style.display = 'flex';
            return;
        }
        
        repos.sort((a, b) => new Date(b.updated_at || b.last_activity_at) - new Date(a.updated_at || a.last_activity_at));
        
        repoHeaderEl.innerHTML = `
            <h3>Repositories for ${username} on ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
            <span class="repo-count">${repos.length}</span>
        `;
        
        setupSearchField(repos.length);
        
        displayRepositories(repos, platform);
        
        downloadAllButton.style.display = 'flex';
        clearButton.style.display = 'flex';
        
    } catch (error) {
        loadingEl.style.display = 'none';
        showError(error.message);
    }
}

function updateUserAvatar(avatarUrl) {
    const defaultAvatar = document.getElementById('default-avatar');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (avatarUrl) {
        defaultAvatar.style.display = 'none';
        profileAvatar.src = avatarUrl;
        profileAvatar.style.display = 'block';
    } else {
        defaultAvatar.style.display = 'block';
        profileAvatar.style.display = 'none';
        profileAvatar.src = '';
    }
}

function setupSearchField(repoCount) {
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    
    searchContainer.style.display = 'block';
    searchInput.value = '';
    searchInput.placeholder = `Search among ${repoCount} repositories...`;
    
    let timeoutId;
    searchInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            const searchTerm = this.value.toLowerCase();
            filterRepositories(searchTerm);
        }, 300);
    });
}

function filterRepositories(searchTerm) {
    const repoItems = document.querySelectorAll('.repo-item');
    let visibleCount = 0; 
    
    repoItems.forEach(item => {
        const repoName = item.querySelector('.repo-name-container').textContent.toLowerCase();
        const repoDesc = item.querySelector('.repo-description')?.textContent.toLowerCase() || '';
        const repoLang = item.querySelector('.repo-language')?.textContent.toLowerCase() || '';
        
        if (repoName.includes(searchTerm) || 
            repoDesc.includes(searchTerm) || 
            repoLang.includes(searchTerm)) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    const noResultsMessage = document.getElementById('no-results-message');
    if (visibleCount === 0 && searchTerm) {
        if (!noResultsMessage) {
            const message = document.createElement('p');
            message.id = 'no-results-message';
            message.className = 'terminal-intro';
            message.innerHTML = `No repositories found matching "<span style="color: var(--terminal-blue)">${searchTerm}</span>"`;
            document.getElementById('repoList').appendChild(message);
        } else {
            noResultsMessage.innerHTML = `No repositories found matching "<span style="color: var(--terminal-blue)">${searchTerm}</span>"`;
            noResultsMessage.style.display = 'block';
        }
    } else if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
    }
}

function displayRepositories(repos, platform) {
    const repoListEl = document.getElementById('repoList');
    
    let repoHtml = '<div class="repo-list-container">';
    
    repos.forEach(repo => {
        const repoName = repo.name;
        let repoUrl, zipUrl, updateDate, createDate, stars, forks, language;
        
        if (platform === 'github') {
            repoUrl = repo.html_url;
            const defaultBranch = repo.default_branch || 'main';
            zipUrl = `${repoUrl}/archive/refs/heads/${defaultBranch}.zip`;
            updateDate = new Date(repo.updated_at).toLocaleDateString();
            createDate = new Date(repo.created_at).toLocaleDateString();
            stars = repo.stargazers_count;
            forks = repo.forks_count;
            language = repo.language || 'Not specified';
        } else if (platform === 'gitlab') {
            repoUrl = repo.web_url;
            zipUrl = `${repoUrl}/-/archive/master/${repo.name}-master.zip`;
            updateDate = new Date(repo.last_activity_at).toLocaleDateString();
            createDate = new Date(repo.created_at).toLocaleDateString();
            stars = repo.star_count;
            forks = repo.forks_count;
            language = 'Not specified';
        }
        
        const repoDescription = repo.description || 'No description available';
        
        repoHtml += `
            <div class="repo-item">
                <div>
                    <div class="repo-name-container" title="${repoName}">${repoName}</div>
                    <div class="repo-description" title="${repoDescription}">${repoDescription}</div>
                </div>
                <div class="repo-info">
                    <div class="repo-dates-langs">
                        <span class="repo-date">Created: ${createDate} | Updated: ${updateDate}</span>
                        <span class="repo-language"><i class="fas fa-code"></i> ${language}</span>
                    </div>
                    <div class="repo-stats">
                        <span title="${stars} stars"><i class="fas fa-star"></i> ${stars}</span>
                        <span title="${forks} forks"><i class="fas fa-code-branch"></i> ${forks}</span>
                    </div>
                    <div class="repo-actions">
                        <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="glow-button secondary" title="View repository">
                            <i class="fas fa-code"></i>
                        </a>
                        <a href="${zipUrl}" class="glow-button secondary" title="Download ZIP">
                            <i class="fas fa-download"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    repoHtml += '</div>';
    repoListEl.innerHTML = repoHtml;
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    errorContainer.style.display = 'block';
}

function resetEverything() {
    const elements = {
        username: document.getElementById('username'),
        repoHeader: document.getElementById('repoHeader'),
        repoList: document.getElementById('repoList'),
        defaultAvatar: document.getElementById('default-avatar'),
        profileAvatar: document.getElementById('profile-avatar'),
        clearButton: document.getElementById('clear-button'),
        searchContainer: document.getElementById('searchContainer'),
        downloadAllButton: document.getElementById('download-all-button'),
        errorContainer: document.getElementById('error-container')
    };
    
    elements.username.value = '';
    elements.repoHeader.innerHTML = '';
    elements.repoList.innerHTML = '';
    elements.searchContainer.style.display = 'none';
    elements.defaultAvatar.style.display = 'block';
    elements.profileAvatar.style.display = 'none';
    elements.profileAvatar.src = '';
    elements.clearButton.style.display = 'none';
    elements.downloadAllButton.style.display = 'none';
    elements.errorContainer.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('username');
    
    inputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkRepositories();
        }
    });
    
    inputField.addEventListener('input', function() {
        document.getElementById('error-container').style.display = 'none';
    });
});