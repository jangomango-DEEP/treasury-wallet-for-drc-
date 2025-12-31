
export interface GithubFile {
  path: string;
  content: string;
}

export class GithubService {
  private token: string;
  private owner: string;
  private repo: string;

  constructor(token: string, repoFullName: string) {
    this.token = token;
    const [owner, repo] = repoFullName.split('/');
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Pushes a single file to GitHub.
   * If the file exists, it updates it.
   */
  async pushFile(file: GithubFile, message: string = 'Update from Treasury Admin'): Promise<boolean> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${file.path}`;
      
      // 1. Try to get the SHA if the file already exists
      let sha: string | undefined;
      const getRes = await fetch(url, {
        headers: { 'Authorization': `token ${this.token}` }
      });
      
      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      }

      // 2. Upload/Update the file
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: btoa(file.content), // GitHub requires Base64
          sha: sha
        })
      });

      return putRes.ok;
    } catch (e) {
      console.error(`GitHub Push Error for ${file.path}:`, e);
      return false;
    }
  }

  /**
   * Pushes multiple files sequentially.
   */
  async pushProject(files: GithubFile[], onProgress: (path: string, current: number, total: number) => void): Promise<boolean> {
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      onProgress(files[i].path, i + 1, files.length);
      const success = await this.pushFile(files[i]);
      if (success) successCount++;
    }
    return successCount === files.length;
  }
}
