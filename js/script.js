const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITLAB_API_BASE_URL = 'https://gitlab.com/api/v4';
const API_RATE_LIMIT_THRESHOLD = 10;

async function fetchAllRepositories(username, page = 1, allRepos = []) {
    try {
        const platform = document.getElementById('platform-select').value;
        let response;
        
        if (platform === 'github') {
            response = await fetch(`${GITHUB_API_BASE_URL}/users/${username}/repos?type=public&per_page=100&page=${page}`);
        } else {
            response = await fetch(`${GITLAB_API_BASE_URL}/users/${username}/projects?visibility=public&per_page=100&page=${page}`);
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        const repos = await response.json();
        const combinedRepos = [...allRepos, ...repos];
        
        if (repos.length === 100) {
            return fetchAllRepositories(username, page + 1, combinedRepos);
        } else {
            return combinedRepos;
        }
    } catch (error) {
        throw error;
    }
}

async function checkApiRateLimit() {
    try {
        const platform = document.getElementById('platform-select').value;
        
        if (platform === 'github') {
            const response = await fetch(`${GITHUB_API_BASE_URL}/rate_limit`);
            if (!response.ok) {
                return { remaining: Infinity };
            }
            
            const rateData = await response.json();
            const remaining = rateData.resources.core.remaining;
            const resetTime = new Date(rateData.resources.core.reset * 1000);
            
            return { remaining, resetTime };
        } else {
            return { remaining: Infinity }; // GitLab doesn't have the same rate limit approach
        }
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return { remaining: Infinity };
    }
}

async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('Please enter a username.');
        return;
    }
    
    const platform = document.getElementById('platform-select').value;
    
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
        if (platform === 'github') {
            const { remaining, resetTime } = await checkApiRateLimit();
            
            if (remaining <= API_RATE_LIMIT_THRESHOLD) {
                throw new Error(`GitHub API rate limit is low (${remaining} remaining). Try again after ${resetTime.toLocaleTimeString()}.`);
            }
        }
        
        let userResponse, userData;
        
        if (platform === 'github') {
            userResponse = await fetch(`${GITHUB_API_BASE_URL}/users/${username}`);
        } else {
            userResponse = await fetch(`${GITLAB_API_BASE_URL}/users?username=${username}`);
        }
        
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error('User not found. Please check the username and try again.');
            } else {
                const userData = await userResponse.json().catch(() => null);
                throw new Error(userData?.message || `Error ${userResponse.status}: ${userResponse.statusText}`);
            }
        }
        
        if (platform === 'github') {
            userData = await userResponse.json();
            updateUserAvatar(userData.avatar_url);
        } else {
            const gitlabUsers = await userResponse.json();
            if (gitlabUsers.length === 0) {
                throw new Error('User not found. Please check the username and try again.');
            }
            userData = gitlabUsers[0];
            updateUserAvatar(userData.avatar_url);
        }
        
        const repos = await fetchAllRepositories(platform === 'github' ? username : userData.id);
        
        loadingEl.style.display = 'none';
        
        if (repos.length === 0) {
            repoHeaderEl.innerHTML = `
                <h3>Repositories for ${username}</h3>
                <span class="repo-count">0</span>
            `;
            repoListEl.innerHTML = '<p class="terminal-intro">No public repositories found.</p>';
            clearButton.style.display = 'flex';
            return;
        }
        
        repos.sort((a, b) => {
            const dateA = platform === 'github' ? new Date(b.updated_at) : new Date(b.last_activity_at);
            const dateB = platform === 'github' ? new Date(a.updated_at) : new Date(a.last_activity_at);
            return dateA - dateB;
        });
        
        repoHeaderEl.innerHTML = `
            <h3>Repositories for ${username}</h3>
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
        if (platform === 'github') {
            const repoName = repo.name;
            const repoUrl = repo.html_url;
            const repoDescription = repo.description || 'No description available';
            const defaultBranch = repo.default_branch || 'main';
            const zipUrl = `${repoUrl}/archive/refs/heads/${defaultBranch}.zip`;
            const updateDate = new Date(repo.updated_at).toLocaleDateString();
            const createDate = new Date(repo.created_at).toLocaleDateString();
            const stars = repo.stargazers_count;
            const forks = repo.forks_count;
            const language = repo.language || 'Not specified';
            
            repoHtml += `
                <div class="repo-item" data-platform="github">
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
        } else {
            const repoName = repo.name;
            const repoUrl = repo.web_url;
            const repoDescription = repo.description || 'No description available';
            const defaultBranch = repo.default_branch || 'main';
            const projectId = encodeURIComponent(repo.id);
            const zipUrl = `${GITLAB_API_BASE_URL}/projects/${projectId}/repository/archive.zip?sha=${defaultBranch}`;
            const updateDate = new Date(repo.last_activity_at).toLocaleDateString();
            const createDate = new Date(repo.created_at).toLocaleDateString();
            const stars = repo.star_count;
            const forks = repo.forks_count;
            const language = 'Not specified'; // GitLab API doesn't provide language directly
            
            repoHtml += `
                <div class="repo-item" data-platform="gitlab">
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
        }
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
    
    document.getElementById('platform-select').addEventListener('change', function() {
        resetEverything();
    });
});