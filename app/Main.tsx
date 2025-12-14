// app/page.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawNFT } from '@/utils/canvas';
import {
  generateRandomTitle,
  generateRandomDescription,
  logToPre,
} from '@/utils';
import {
  createFileOnGithub,
  deleteFileOnGithub,
  getFileSha,
  listNFTs,
  NFTFile,
  GitHubConfig,
} from '@/services/github';
import { FaGithub } from 'react-icons/fa';
import LoginBtn from './LoginBtn';

// --- Types ---
type Tab = 'preview' | 'list';
type StatusType = 'neutral' | 'success' | 'error';
type ImageFormat = 'png' | 'jpg' | 'svg' | 'avif' | 'webp';

// --- Constants ---
const CANVAS_WIDTH = 2048;
const CANVAS_HEIGHT = 1152;

// Helper to map status type to Tailwind classes
const getStatusClasses = (type: StatusType): string => {
  switch (type) {
    case 'success':
      return 'small success text-green-350';
    case 'error':
      return 'small error text-red-350';
    case 'neutral':
    default:
      return 'small text-slate-450';
  }
};

const formatMap: { [key in ImageFormat]: { icon: string; label: string } } = {
  png: { icon: '📄', label: 'Save PNG' },
  jpg: { icon: '📷', label: 'Save JPG' },
  svg: { icon: '🎨', label: 'Save SVG' },
  avif: { icon: '🖼️', label: 'Save AVIF' },
  webp: { icon: '🌐', label: 'Save WEBP' },
};

export default function NftEditor() {
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logRef = useRef<HTMLPreElement>(null);

  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [config, setConfig] = useState({
    token: '',
    owner: '',
    repo: '',
    branch: 'main',
    pathPrefix: 'nfts',
    title: 'My NFT',
    desc: 'Generated from GitHub Pages NFT Editor',
  });
  const [status, setStatus] = useState({
    message: '',
    type: 'neutral' as StatusType,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] =
    useState<ImageFormat>('png');
  const [nftList, setNftList] = useState<NFTFile[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [isListing, setIsListing] = useState(false);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setConfig((prev) => ({ ...prev, [id]: value.trim() }));
  };

  const updateStatus = useCallback((message: string, isError: boolean) => {
    setStatus({ message, type: isError ? 'error' : 'success' });
  }, []);

  const runDrawNFT = useCallback((customTitle?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const title = customTitle ?? config.title;

    drawNFT(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, title);
    updateStatus('Preview drawn.', false);
  }, [config.title, updateStatus]);

  // Initial Draw and effect for config change
  useEffect(() => {
    runDrawNFT();
  }, [runDrawNFT]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsExpanded(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleExpand = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isExpanded) {
      document.exitFullscreen().catch(() => {});
    } else {
      canvas.requestFullscreen().catch(() => {});
    }
    setIsExpanded(!isExpanded);
  };

  // Re-generate
  const handleRegenerate = () => {
    const randomTitle = generateRandomTitle();
    const randomDesc = generateRandomDescription();
    setConfig((prev) => ({ ...prev, title: randomTitle, desc: randomDesc }));
    runDrawNFT(randomTitle);
    updateStatus(
      'Preview drawn with new random title and description.',
      false
    );
  };

  // Download logic
  const downloadFile = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCanvas = (format: ImageFormat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const title = config.title.trim() || 'My_NFT';
    const fileName = `${title.replace(/[^a-z0-9\-]/gi, '_')}_${Date.now()}`;

    try {
      let dataUrl: string;

      switch (format) {
        case 'png':
          dataUrl = canvas.toDataURL('image/png');
          downloadFile(dataUrl, `${fileName}.png`);
          updateStatus('Downloaded as PNG', false);
          break;

        case 'jpg':
          dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          downloadFile(dataUrl, `${fileName}.jpg`);
          updateStatus('Downloaded as JPG', false);
          break;

        case 'webp':
          dataUrl = canvas.toDataURL('image/webp', 0.95);
          downloadFile(dataUrl, `${fileName}.webp`);
          updateStatus('Downloaded as WEBP', false);
          break;

        case 'avif':
          try {
            dataUrl = canvas.toDataURL('image/avif', 0.95);
            downloadFile(dataUrl, `${fileName}.avif`);
            updateStatus('Downloaded as AVIF', false);
          } catch (err) {
            updateStatus(
              'AVIF not supported - downloading as PNG instead',
              true
            );
            dataUrl = canvas.toDataURL('image/png');
            downloadFile(dataUrl, `${fileName}.png`);
          }
          break;

        case 'svg':
          const pngData = canvas.toDataURL('image/png');
          const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${pngData}"/>
</svg>`;
          const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          downloadFile(svgUrl, `${fileName}.svg`);
          setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
          updateStatus('Downloaded as SVG', false);
          break;
      }
    } catch (err: any) {
      console.error('Download error:', err);
      updateStatus('Download failed: ' + err.message, true);
    }
  };

  // Mint logic
  const handleMint = async () => {
    const { token, owner, repo, branch, pathPrefix, title, desc } = config;
    const logEl = logRef.current;

    if (!logEl) return;

    try {
      if (!token || !owner || !repo) {
        updateStatus('Chưa nhập token/owner/repo', true);
        return;
      }

      setIsMinting(true);
      logToPre(logEl, '--- Starting generation ---');

      // 1. Draw and get base64
      runDrawNFT(title);
      updateStatus('Canvas generated. Preparing upload...', false);

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas ref not found.');

      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];

      // 2. Filenames
      const ts = Date.now();
      const safeTitle = title.replace(/[^a-z0-9\-]/gi, '_');
      const imagePath = `${pathPrefix}/${safeTitle}_${ts}.png`;
      const metaPath = `${pathPrefix}/${safeTitle}_${ts}.json`;

      // 3. Upload Image
      logToPre(logEl, 'Uploading image to', `${owner}/${repo}/${imagePath}`);
      await createFileOnGithub({
        token,
        owner,
        repo,
        branch,
        path: imagePath,
        contentBase64: base64,
        message: `Add NFT image ${imagePath}`,
      });

      // 4. Upload Metadata
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURIComponent(
        imagePath
      )}`;
      const metadata = {
        name: title,
        description: desc,
        image: rawUrl,
        created_at: new Date().toISOString(),
      };
      const metadataBase64 = btoa(
        unescape(encodeURIComponent(JSON.stringify(metadata, null, 2)))
      );

      logToPre(logEl, 'Uploading metadata to', `${owner}/${repo}/${metaPath}`);
      await createFileOnGithub({
        token,
        owner,
        repo,
        branch,
        path: metaPath,
        contentBase64: metadataBase64,
        message: `Add NFT metadata ${metaPath}`,
      });

      updateStatus('Done — image + metadata pushed.', false);
      logToPre(logEl, 'All done. Image:', rawUrl);
    } catch (err: any) {
      console.error(err);
      updateStatus('Error: ' + (err.message || err), true);
      logToPre(logEl, 'ERROR:', err);
    } finally {
      setIsMinting(false);
    }
  };

  // List NFTs logic
  const handleListNFTs = async () => {
    alert('handleListNFTs called');
    const { token, owner, repo, branch, pathPrefix } = config;
    const logEl = logRef.current;

    if (!logEl) {
      alert('logEl not found');
      return;
    }

    alert('Config: token=' + !!token + ', owner=' + owner + ', repo=' + repo);

    try {
      if (!token || !owner || !repo) {
        updateStatus('Chưa nhập token/owner/repo', true);
        return;
      }

      alert('Proceeding to list NFTs');
      setIsListing(true);
      const gitHubConfig: GitHubConfig = { token, owner, repo, branch };

      const list = await listNFTs(
        gitHubConfig,
        pathPrefix,
        logEl,
        (msg, isErr) => setStatus({ message: msg, type: isErr ? 'error' : 'success' })
      );
      setNftList(list);
    } catch (err: any) {
      console.error(err);
      updateStatus('Error listing NFTs: ' + (err.message || err), true);
      logToPre(logEl, 'ERROR:', err);
      setNftList([]);
    } finally {
      setIsListing(false);
    }
  };

  // Remove NFT logic
  const handleRemoveNFT = async (nft: NFTFile) => {
    const { token, owner, repo, branch } = config;
    const logEl = logRef.current;

    if (!logEl) return;

    if (
      !confirm(
        `Remove NFT: ${nft.metadataPath} and ${nft.imagePath}?`
      )
    ) {
      return;
    }

    try {
      // 1. Get SHA for image file (since it's not in the JSON metadata)
      const imageSha = await getFileSha(
        { token, owner, repo, branch },
        nft.imagePath
      );

      // 2. Delete metadata
      await deleteFileOnGithub({
        token,
        owner,
        repo,
        branch,
        path: nft.metadataPath,
        sha: nft.metadataSha,
        message: `Remove NFT metadata ${nft.metadataPath}`,
      });

      // 3. Delete image
      await deleteFileOnGithub({
        token,
        owner,
        repo,
        branch,
        path: nft.imagePath,
        sha: imageSha,
        message: `Remove NFT image ${nft.imagePath}`,
      });

      logToPre(logEl, `Removed ${nft.metadataPath} and ${nft.imagePath}`);
      // Refresh list
      handleListNFTs();
    } catch (err: any) {
      logToPre(logEl, 'Error removing:', err);
      alert('Error removing NFT: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-850 text-slate-150 p-6">
      <div className="card bg-white/5 p-4 rounded-xl max-w-4xl mx-auto shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">NFT Editor → GitHub</h2>
          <div className="flex space-x-2">
            <LoginBtn />
            <button
              className={`tab-button px-4 py-1 rounded-lg transition ${
                activeTab === 'preview'
                  ? 'bg-slate-150/20'
                  : 'bg-slate-150/5 border border-slate-150/10'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Panel
            </button>
            <button
              className={`tab-button px-4 py-1 rounded-lg transition ${
                activeTab === 'list'
                  ? 'bg-slate-150/20'
                  : 'bg-slate-150/5 border border-slate-150/10'
              }`}
              onClick={() => { alert('Switching to list tab'); setActiveTab('list'); }}
            >
              List
            </button>
          </div>
        </div>

        {/* Global Config Inputs */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 min-w-0" style={{ flexBasis: '50%' }}>
            <label htmlFor="token" className="block mt-2 text-xs text-slate-300/60">
              Token (PAT)
            </label>
            <div className="relative mt-1">
              <button
                onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                title="Create GitHub Personal Access Token"
              >
                <FaGithub size={20} />
              </button>
              <input
                id="token"
                placeholder="ghp_xxx..."
                value={config.token}
                onChange={handleInputChange}
                className="w-full pl-10 p-2 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0" style={{ flexBasis: '20%' }}>
            <label htmlFor="owner" className="block mt-2 text-xs text-slate-300/60">
              Owner
            </label>
            <input
              id="owner"
              placeholder="username or org"
              value={config.owner}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none"
            />
          </div>
          <div className="flex-1 min-w-0" style={{ flexBasis: '30%' }}>
            <label htmlFor="repo" className="block mt-2 text-xs text-slate-300/60">
              Repo
            </label>
            <input
              id="repo"
              placeholder="repository"
              value={config.repo}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none"
            />
          </div>
        </div>

        {/* Preview Tab Content */}
        {activeTab === 'preview' && (
          <div id="preview-tab">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 min-w-0" style={{ flexBasis: '20%' }}>
                <label htmlFor="branch" className="block text-xs text-slate-300/60">
                  Branch
                </label>
                <input
                  id="branch"
                  placeholder="main"
                  value={config.branch}
                  onChange={handleInputChange}
                  className="w-full p-2 mt-1 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none"
                />
              </div>
              <div className="flex-1 min-w-0" style={{ flexBasis: '25%' }}>
                <label
                  htmlFor="pathPrefix"
                  className="block text-xs text-slate-300/60"
                >
                  Folder path
                </label>
                <input
                  id="pathPrefix"
                  placeholder="nfts"
                  value={config.pathPrefix}
                  onChange={handleInputChange}
                  className="w-full p-2 mt-1 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none"
                />
              </div>
              <div className="flex-1 min-w-0" style={{ flexBasis: '55%' }}>
                <label htmlFor="title" className="block text-xs text-slate-300/60">
                  Title
                </label>
                <input
                  id="title"
                  placeholder="My awesome NFT"
                  value={config.title}
                  onChange={handleInputChange}
                  className="w-full p-2 mt-1 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label htmlFor="desc" className="block text-xs text-slate-300/60">
                  Description
                </label>
                <input
                  id="desc"
                  placeholder="Một NFT đẹp từ GitHub Pages"
                  value={config.desc}
                  onChange={handleInputChange}
                  className="w-full p-2 mt-1 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none"
                />
              </div>
            </div>

            <div className="canvas-container relative inline-block max-w-full">
              <canvas
                ref={canvasRef}
                id="canvas"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="block my-3 rounded-lg bg-linear-to-br from-cyan-550 to-violet-650 max-w-full h-auto"
                style={{
                  maxWidth: '100%',
                  aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                }}
              ></canvas>
              <span
                id="expand-icon"
                className="absolute top-2.5 right-2.5 text-white text-2xl cursor-pointer"
                onClick={handleExpand}
              >
                {isExpanded ? '✖' : '🔍'}
              </span>
            </div>

            <div className="button-group flex gap-3 mt-3">
              <button
                id="preview"
                type="button"
                onClick={handleRegenerate}
                className="flex-1 p-2 rounded-lg cursor-pointer bg-slate-150/5 border border-slate-150/10 transition hover:bg-slate-150/10"
              >
                Re-generate
              </button>

              <div
                className={`dropdown relative flex gap-[1px] flex-1 ${
                  isDropdownOpen ? 'open' : ''
                }`}
                onBlur={() => setIsDropdownOpen(false)}
              >
                <button
                  className="download-main-btn flex-1 bg-slate-150/5 border border-slate-150/10 border-r-0 text-inherit p-2 rounded-l-lg cursor-pointer text-sm transition hover:bg-slate-150/10"
                  id="download-btn"
                  type="button"
                  onClick={() => downloadCanvas(downloadFormat)}
                >
                  Export as {downloadFormat.toUpperCase()}
                </button>
                <button
                  className="dropdown-trigger flex items-center justify-center bg-slate-150/5 border border-slate-150/10 border-l-0 text-inherit p-2 rounded-r-lg cursor-pointer text-sm transition hover:bg-slate-150/10 w-8"
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div
                    className={`dropdown-arrow w-0 h-0 border-l-4 border-r-4 border-t-[5px] border-l-transparent border-r-transparent border-t-current transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  ></div>
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu absolute top-[calc(100%+4px)] left-0 bg-blue-700/98 border border-white/10 rounded-lg p-1 min-w-[140px] shadow-2xl z-1000 transition-all">
                    {Object.entries(formatMap).map(([format, { icon, label }]) => (
                      <div
                        key={format}
                        className="dropdown-item flex items-center gap-2 p-2 rounded cursor-pointer text-sm text-slate-150 transition hover:bg-slate-150/15 whitespace-nowrap"
                        onClick={() => {
                          setDownloadFormat(format as ImageFormat);
                          setIsDropdownOpen(false);
                          downloadCanvas(format as ImageFormat);
                        }}
                      >
                        <span className="dropdown-item-icon text-xs opacity-70">
                          {icon}
                        </span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                id="generate"
                onClick={handleMint}
                disabled={isMinting}
                className="flex-1 p-2 rounded-lg cursor-pointer transition bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isMinting ? 'Minting...' : 'Mint'}
              </button>
            </div>

            <div className="small muted text-sm text-slate-450 mt-2">
              <div id="status" className={getStatusClasses(status.type)}>
                {status.message}
              </div>
              <pre
                ref={logRef}
                id="log"
                className="bg-black/20 p-2 mt-2 rounded-md h-24 overflow-auto text-xs"
              ></pre>
            </div>
          </div>
        )}

        {/* List Tab Content */}
        {activeTab === 'list' && (
          <div id="list-tab">
            <button
              id="list"
              type="button"
              onClick={handleListNFTs}
              disabled={isListing}
              className="w-full p-2 rounded-lg cursor-pointer transition bg-slate-150/5 border border-slate-150/10 hover:bg-slate-150/10 disabled:opacity-50"
            >
              {isListing ? 'Loading List...' : 'List NFTs'}
            </button>
            <div id="nft-list" className="mt-5">
              {nftList.length > 0 ? (
                <>
                  <h3 className="text-xl font-semibold mb-3">Minted NFTs:</h3>
                  <ul className="space-y-4">
                    {nftList.map((nft) => (
                      <li
                        key={nft.metadataPath}
                        className="p-3 border-b border-white/10"
                      >
                        <strong className="text-lg block">{nft.name}</strong>
                        <span className="text-slate-450 block mb-1">
                          {nft.description}
                        </span>
                        <div className="flex items-start gap-4 mt-2">
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="text-sm">
                            <p>
                              **Created:** {new Date(nft.created_at).toLocaleString()}
                            </p>
                            <p>
                              **Metadata:**{' '}
                              <span className="truncate max-w-xs inline-block">
                                {nft.metadataPath}
                              </span>
                            </p>
                            <button
                              className="remove-btn mt-2 px-3 py-1 bg-red-600 rounded-md text-sm hover:bg-red-700 transition"
                              data-sha={nft.metadataSha}
                              data-path={nft.metadataPath}
                              onClick={() => handleRemoveNFT(nft)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-slate-450">
                  {isListing ? 'Loading...' : 'No NFTs found.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}