async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Please enter a GitHub username.');
        return;
    }

    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '<p>Loading repositories...</p>';

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?type=public&per_page=100`);
        if (!response.ok) {
            throw new Error('User not found or no public repositories.');
        }
        const repos = await response.json();
        if (repos.length === 0) {
            repoHeaderEl.innerHTML = '<h3>Public Repositories: 0</h3>';
            repoListEl.innerHTML = '<p>No public repositories found.</p>';
            return;
        }

        repoHeaderEl.innerHTML = `<h3>Public Repositories: ${repos.length}</h3>`;
        let repoHtml = '<ul>';
        repos.forEach(repo => {
            const repoName = repo.name;
            const repoUrl = repo.html_url;
            const zipUrl = `${repoUrl}/archive/refs/heads/${repo.default_branch}.zip`;
            repoHtml += `<li><div class="repo-name-container">${repoName}</div> <a href="${zipUrl}" download class="glow-button secondary">Download ZIP</a></li>`;
        });
        repoHtml += '</ul>';
        repoListEl.innerHTML = repoHtml;
    } catch (error) {
        repoHeaderEl.innerHTML = '';
        repoListEl.innerHTML = `<p class="terminal-error">${error.message}</p>`;
    }
}