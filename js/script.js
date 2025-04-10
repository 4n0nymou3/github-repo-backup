async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Please enter a GitHub username.');
        return;
    }

    const repoTitleEl = document.getElementById('repoTitle');
    const repoItemsEl = document.getElementById('repoItems');
    repoItemsEl.innerHTML = '<p>Loading repositories...</p>';
    repoTitleEl.innerHTML = '';

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?type=public&per_page=100`);
        if (!response.ok) {
            throw new Error('User not found or no public repositories.');
        }
        const repos = await response.json();
        if (repos.length === 0) {
            repoItemsEl.innerHTML = '<p>No public repositories found.</p>';
            repoTitleEl.innerHTML = 'Public Repositories: 0';
            return;
        }

        repoTitleEl.innerHTML = `Public Repositories: ${repos.length}`;
        let repoHtml = '<ul>';
        repos.forEach(repo => {
            const repoName = repo.name;
            const repoUrl = repo.html_url;
            const zipUrl = `${repoUrl}/archive/refs/heads/${repo.default_branch}.zip`;
            repoHtml += `<li><div class="repo-name-container">${repoName}</div> <a href="${zipUrl}" download class="glow-button secondary">Download ZIP</a></li>`;
        });
        repoHtml += '</ul>';
        repoItemsEl.innerHTML = repoHtml;
    } catch (error) {
        repoItemsEl.innerHTML = `<p class="terminal-error">${error.message}</p>`;
        repoTitleEl.innerHTML = 'Public Repositories: -';
    }
}