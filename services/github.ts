// github-api.ts
import { logToPre } from '../utils';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

interface CreateFileParams extends GitHubConfig {
  path: string;
  contentBase64: string;
  message?: string;
}

interface DeleteFileParams extends GitHubConfig {
  path: string;
  sha: string;
  message?: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  created_at: string;
}

export interface NFTFile extends NFTMetadata {
  metadataPath: string;
  metadataSha: string;
  imagePath: string;
}

export async function createFileOnGithub({
  token,
  owner,
  repo,
  branch,
  path,
  contentBase64,
  message,
}: CreateFileParams): Promise<any> {
  const url = `https://api.github.com/repos/${encodeURIComponent(
    owner
  )}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  const body = {
    message: message || `Add ${path}`,
    content: contentBase64,
    branch: branch,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: 'token ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const j = await res.json();
  if (!res.ok) {
    let msg = `GitHub API error ${res.status}`;
    if (j && j.message) msg += ': ' + j.message;
    throw new Error(
      msg + (j && j.errors ? '\n' + JSON.stringify(j.errors) : '')
    );
  }
  return j;
}

export async function deleteFileOnGithub({
  token,
  owner,
  repo,
  branch,
  path,
  sha,
  message,
}: DeleteFileParams): Promise<any> {
  const url = `https://api.github.com/repos/${encodeURIComponent(
    owner
  )}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  const body = {
    message: message || `Delete ${path}`,
    sha: sha,
    branch: branch,
  };
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: 'token ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const j = await res.json();
  if (!res.ok) {
    let msg = `GitHub API error ${res.status}`;
    if (j && j.message) msg += ': ' + j.message;
    throw new Error(
      msg + (j && j.errors ? '\n' + JSON.stringify(j.errors) : '')
    );
  }
  return j;
}

export async function getFileSha(
  config: GitHubConfig,
  path: string
): Promise<string> {
  const { token, owner, repo, branch } = config;
  const url = `https://api.github.com/repos/${encodeURIComponent(
    owner
  )}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
    path
  )}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: 'token ' + token,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get file SHA: ${res.status}`);
  }
  const data = await res.json();
  return data.sha;
}

// export async function listNFTs(
//   config: GitHubConfig,
//   pathPrefix: string,
//   logEl: HTMLPreElement,
//   setStatus: (message: string, isError: boolean) => void
// ): Promise<NFTFile[]> {
//   const { token, owner, repo, branch } = config;
//   logToPre(logEl, '--- Listing NFTs ---');
//   setStatus('Loading...', false);

//   const url = `https://api.github.com/repos/${encodeURIComponent(
//     owner
//   )}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
//     pathPrefix
//   )}?ref=${encodeURIComponent(branch)}`;
//   const res = await fetch(url, {
//     headers: {
//       Authorization: 'token ' + token,
//       Accept: 'application/vnd.github+json',
//     },
//   });

//   if (!res.ok) {
//     throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
//   }

//   const files: { name: string; download_url: string; sha: string; path: string }[] = await res.json();
//   const jsonFiles = files.filter((f) => f.name.endsWith('.json'));

//   if (jsonFiles.length === 0) {
//     setStatus('No NFTs found.', false);
//     return [];
//   }

//   const nfts: NFTFile[] = [];
//   for (const file of jsonFiles) {
//     const metaRes = await fetch(file.download_url);
//     const metadata: NFTMetadata = await metaRes.json();
//     nfts.push({
//       ...metadata,
//       metadataPath: file.path,
//       metadataSha: file.sha,
//       // Infer image path from metadata path (e.g., nfts/My_NFT_123.json -> nfts/My_NFT_123.png)
//       imagePath: file.path.replace('.json', '.png'),
//     });
//   }

//   setStatus(`Listed ${jsonFiles.length} NFTs.`, false);
//   return nfts;
// }

// github-api.ts - Cập nhật hàm listNFTs
export async function listNFTs(
  config: GitHubConfig,
  pathPrefix: string,
  logEl: HTMLPreElement,
  setStatus: (message: string, isError: boolean) => void
): Promise<NFTFile[]> {
  const { token, owner, repo, branch } = config;
  logToPre(logEl, '--- Listing NFTs ---');
  setStatus('Loading...', false);

  const url = `https://api.github.com/repos/${encodeURIComponent(
    owner
  )}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
    pathPrefix
  )}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: 'token ' + token,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    // Thêm log lỗi chi tiết
    logToPre(logEl, `GitHub API failed. Status: ${res.status}. Response: ${errorText.substring(0, 100)}...`);
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
  }

  const files: { name: string; download_url: string; sha: string; path: string }[] = await res.json();

  // Thêm log để kiểm tra số lượng file trả về
  logToPre(logEl, `API returned ${files.length} files/folders in path: ${pathPrefix}`);

  const jsonFiles = files.filter((f) => f.name.endsWith('.json'));

  // Thêm log để kiểm tra số lượng file JSON đã lọc
  logToPre(logEl, `Found ${jsonFiles.length} metadata (.json) files.`);


  if (jsonFiles.length === 0) {
    setStatus('No NFTs found.', false);
    return [];
  }

    const nfts: NFTFile[] = [];
  for (const file of jsonFiles) {
    const metaRes = await fetch(file.download_url);
    const metadata: NFTMetadata = await metaRes.json();
    nfts.push({
      ...metadata,
      metadataPath: file.path,
      metadataSha: file.sha,
      // Infer image path from metadata path (e.g., nfts/My_NFT_123.json -> nfts/My_NFT_123.png)
      imagePath: file.path.replace('.json', '.png'),
    });
  }

  setStatus(`Listed ${jsonFiles.length} NFTs.`, false);
  return nfts;
}
