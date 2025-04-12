let globalRepos = [];
async function fetchAllRepositories(username, page = 1, allRepos = []) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?type=public&per_page=100&page=${page}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
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
async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('Please enter a GitHub username.');
        return;
    }
    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    const loadingEl = document.getElementById('loading');
    const clearButton = document.getElementById('clear-button');
    const downloadAllButton = document.getElementById('download-all');
    const searchContainer = document.getElementById('searchContainer');
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '';
    loadingEl.style.display = 'flex';
    clearButton.style.display = 'flex';
    downloadAllButton.style.display = 'none';
    searchContainer.style.display = 'none';
    try {
        const rateResponse = await fetch('https://api.github.com/rate_limit');
        const rateData = await rateResponse.json();
        if (rateData.resources.core.remaining <= 5) {
            const resetDate = new Date(rateData.resources.core.reset * 1000);
            throw new Error(`GitHub API rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}.`);
        }
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error('User not found. Please check the username and try again.');
            } else {
                throw new Error(`Error ${userResponse.status}: ${userResponse.statusText}`);
            }
        }
        const userData = await userResponse.json();
        if (userData.avatar_url) {
            document.getElementById('default-avatar').style.display = 'none';
            const profileAvatar = document.getElementById('profile-avatar');
            profileAvatar.src = userData.avatar_url;
            profileAvatar.style.display = 'block';
        }
        const repos = await fetchAllRepositories(username);
        globalRepos = repos;
        loadingEl.style.display = 'none';
        if (repos.length === 0) {
            repoHeaderEl.innerHTML = `
                <h3>Repositories for ${username}</h3>
                <span class="repo-count">0</span>
            `;
            repoListEl.innerHTML = '<p class="terminal-intro">No public repositories found.</p>';
            return;
        }
        repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        repoHeaderEl.innerHTML = `
            <h3>Repositories for ${username}</h3>
            <span class="repo-count">${repos.length}</span>
        `;
        searchContainer.style.display = 'block';
        document.getElementById('searchInput').value = '';
        document.getElementById('searchInput').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const repoItems = document.querySelectorAll('.repo-item');
            repoItems.forEach(item => {
                const repoName = item.querySelector('.repo-name-container').textContent.toLowerCase();
                const repoDesc = item.querySelector('.repo-description')?.textContent.toLowerCase() || '';
                if (repoName.includes(searchTerm) || repoDesc.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        let repoHtml = '<div class="repo-list-container">';
        repos.forEach(repo => {
            const repoName = repo.name;
            const repoUrl = repo.html_url;
            const repoDescription = repo.description || 'No description available';
            const zipUrl = `${repoUrl}/archive/refs/heads/${repo.default_branch}.zip`;
            const updateDate = new Date(repo.updated_at).toLocaleDateString();
            const createDate = new Date(repo.created_at).toLocaleDateString();
            const stars = repo.stargazers_count;
            const forks = repo.forks_count;
            const language = repo.language || 'Not specified';
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
                            <span><i class="fas fa-star"></i> ${stars}</span>
                            <span><i class="fas fa-code-branch"></i> ${forks}</span>
                        </div>
                        <div class="repo-actions">
                            <a href="${repoUrl}" target="_blank" class="glow-button secondary" title="View repository">
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
        downloadAllButton.style.display = 'flex';
    } catch (error) {
        loadingEl.style.display = 'none';
        repoHeaderEl.innerHTML = '';
        repoListEl.innerHTML = `<p class="terminal-error"><i class="fas fa-exclamation-triangle"></i> ${error.message}</p>`;
    }
}
async function downloadAllRepos() {
    if (!globalRepos || globalRepos.length === 0) {
        return;
    }
    const zip = new JSZip();
    const promises = globalRepos.map(async repo => {
        const zipUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`;
        const response = await fetch(zipUrl);
        if (response.ok) {
            const blob = await response.blob();
            zip.file(`${repo.name}.zip`, blob);
        }
    });
    await Promise.all(promises);
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "all_repositories.zip";
    a.click();
}
function showError(message) {
    const repoListEl = document.getElementById('repoList');
    repoListEl.innerHTML = `<p class="terminal-error"><i class="fas fa-exclamation-triangle"></i> ${message}</p>`;
}
function resetEverything() {
    const username = document.getElementById('username');
    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    const defaultAvatar = document.getElementById('default-avatar');
    const profileAvatar = document.getElementById('profile-avatar');
    const clearButton = document.getElementById('clear-button');
    const downloadAllButton = document.getElementById('download-all');
    const searchContainer = document.getElementById('searchContainer');
    username.value = '';
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '';
    searchContainer.style.display = 'none';
    defaultAvatar.style.display = 'block';
    profileAvatar.style.display = 'none';
    profileAvatar.src = '';
    clearButton.style.display = 'none';
    downloadAllButton.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('username');
    inputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkRepositories();
        }
    });
});