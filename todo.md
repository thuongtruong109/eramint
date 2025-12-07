✅ Tạo NFT (ảnh, SVG, filter, effect, text overlay…)
✅ Website sẽ upload trực tiếp vào repo tai /nfts

- /nfts/images/<id>.png
- /nfts/metadata/<id>.json

✅ Lưu file NFT đã tạo
✅ Dữ liệu được versioned (mỗi NFT là một commit)
✅ Preview NFT

Chỉnh sửa like Figma mini (drag, scale, color)

Generate ra:

PNG

SVG

JSON metadata

- GitHub Actions có thể auto-build gallery

- UI: canvas editor, drag/drop, text, layer, filter, gradient, random generator…
- Press "Mint" → generate file.

Pages hiển thị gallery NFT luôn

Dữ liệu nằm trong repo → scale vô hạn

Bạn sẽ có history “evolution” của mỗi NFT cực hay.

3. Auto Regenerate Gallery

GitHub Actions đọc /nfts/\*\* → build website → publish lên Pages.

💡 Bonus Ideas Extra (để dự án càng chất)
✨ Thêm AI Module (Client-Side, chạy WebGPU/WebLLM)

Sinh prompt → generate NFT base image

Rồi user chỉnh lại bằng editor

✨ Random Collection Generator

Input assets (eyes, hair, background…)

Generate 10k NFT như CryptoPunks/BAYC, hoàn toàn chạy trong browser.

✨ GitHub Issue = NFT Request

Người dùng mở issue:
"Mint a pixel avatar với theme cyberpunk"
→ Bot GitHub Actions auto generate + commit NFT.

✨ Add NFT Trading Simulator

Không blockchain nhưng giả lập Marketplace trong Pages:

Buy

Sell

Bid

Stat
→ Tất cả là JSON trong repo 🧠

✅ A. NFT Editor

Cho phép người dùng tự thiết kế NFT:

Canvas editor (fabric.js / konva.js / html2canvas)

Tùy chọn:

Upload ảnh

Chèn text, emoji, icon

Chèn layer hiệu ứng (gradient, noise…)

Kéo thả, resize, rotate

Live preview

Export ra PNG/SVG

✅ B. NFT Generator (auto generation)

Bấm nút Generate Random NFT →

Website sẽ tạo NFT ngẫu nhiên, ví dụ:

Hậu cảnh random gradient

Random pattern

Random shape

Random text / quote

Random mascot icon (SVG)

Tạo mỗi lần khác nhau → ra chuỗi NFT random đẹp đẹp.

Một app GitHub Pages như sau:

NFT Studio
├─ NFT Editor (custom)
├─ NFT Generator (random)
└─ Save to GitHub repo (no backend)

User có 2 mode:

Editor Mode: Tự design → Save

Generator Mode: Random NFT → Save

NFT sau khi Save → push thẳng vào /nfts/<timestamp>.png trong chính repo.

🧠 Cách Save vào Repo không cần Backend

Frontend sẽ dùng:

👉 GitHub API:

PUT /repos/:owner/:repo/contents/:path

Workflow:

Canvas → base64 PNG

Convert sang base64

Gửi request lên GitHub API

API tự tạo file .png trong repo

🎨 Giao diện đề xuất
+-----------------------------------+
| NFT Studio |
+-------------------+---------------+
| Editor / Generate| NFT Preview |
| | |
| [Upload Image] | [Save to GitHub]
| [Add Text] |
| [Add Icon] |
| [Random NFT] |
+-----------------------------------+

Dùng clean UI kiểu Tailwind + shadcn.

Tạo bộ sưu tập 100 NFT

Web3 Mint (optional)

Export ZIP chứa nhiều NFT

Gallery tab hiển thị toàn bộ file trong /nfts (dùng GitHub API GET list)

🚧 Nếu muốn, tôi có thể build sẵn repo template:

/index.html

/src/editor.js

/src/generator.js

/src/github.js

⚡ Nâng cấp có thể thêm

1. Random seed đảm bảo deterministic

→ Mỗi NFT có thể regenerate bằng seed.

2. Multiple NFT collections

/collections/cats/

/collections/pixel/

/collections/abstract/

3. NFT Marketplace nội bộ

Like / star / comment

Tất cả được lưu bằng Issues (khỏi cần DB)

4. Trait system giống CryptoPunks

Background

Eyes

Mouth

Accessories → Editor tạo ảnh theo layers.

Tự động mở popup OAuth (hướng dẫn + code OAuth PKCE) để tránh PAT?

Hoặc biến thành SPA đẹp hơn (Tailwind + uploader + crop tool + preview + IPFS upload).

Hoặc dùng GitHub Pages + GitHub Actions flow để không cần token ở client.
