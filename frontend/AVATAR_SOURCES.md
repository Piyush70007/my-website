# Portfolio portrait

The user supplied photographs as likeness references and approved using a generated portrait in the local project and website. The original photographs have not been copied into this project.

`public/assets/avatar/piyush-bust-black-shirt.png` was created with the built-in image generation tool. It is a transparent raster illustration, not a 3D model. The final edit preserved the face, hair, beard and softened under-eye shading; changed the inner polo to matte black; retained the black jacket; and cropped the isolated bust slightly below the chest. No text or pedestal was requested.

3D generation is being attempted through Microsoft's official TRELLIS.2 demo:

- https://huggingface.co/spaces/microsoft/TRELLIS.2
- https://microsoft.github.io/TRELLIS.2/

The first mesh used an earlier, longer torso reference. Generation of the revised reference hit the demo's anonymous ZeroGPU quota. This early attempt did not produce a usable download. The subsequently selected Hyper3D Rodin export is documented below.

The intended runtime serves the final assets locally; it must not contact a generation service from visitors' browsers.

## Likeness review and alternatives (13 November 2026)

The signed-in TRELLIS.2 run completed for the revised black-shirt bust, but Piyush rejected its facial likeness before export. It has not been installed in the website.

Alternative workflows reviewed from official documentation and in Chrome:

- Avaturn: a face-specific creator with downloadable avatars. Its upload screen requires three matching photographs: front, left, and right, at selfie distance, from the same camera and without glasses. The existing reference set does not meet those requirements.
- Hyper3D ChatAvatar: dedicated facial assets from one portrait; sign-in requires terms acceptance. Free output has restricted personal-use licensing; promotional use requires a purchased licence. No purchase was made by the agent.
- Tripo: single-image free generation, but free models are public under CC BY 4.0; multi-view requires a subscription. No portrait was uploaded there.
- Hitem3D: current free plan lists no model downloads and public outputs. No portrait was uploaded there.
- MetaPerson Creator: a single-photo candidate was generated and inspected in its editor. No MetaPerson model was exported or installed.

Sources:

- https://avaturn.dev/
- https://hyper3d.ai/blog/chatavatar
- https://hyper3d.ai/legal/terms
- https://www.tripo3d.ai/features/image-to-3d-model
- https://www.hitem3d.ai/pricing
- https://avatarsdk.com/metaperson-creator/

## Current review status

Piyush activated the Hyper3D Creator trial himself. ChatAvatar generated a face-only preview from a compressed copy of the original photograph; its private toggle was enabled and verified. The result lacked hair and was not suitable as a finished bust.

At Piyush's direction, Rodin Gen-2.5 then used only the approved generated black-shirt portrait. Private mode was enabled before generation and verified on the resulting asset. Extreme-High geometry and Native material generation with Face Restore and De-light were used. The exported PBR GLB was 40,343,940 bytes. A local glTF Transform 4.5.1 optimization reduced it to approximately 3.17 MB, using meshopt compression, 2K WebP textures, and bounded geometry simplification. The decoded GLB loaded successfully in the local Three.js viewer, but Piyush rejected the rendered likeness. The candidate was therefore removed from public assets and retained under ignored `output/avatar-inputs/rodin/` for comparison only.

Piyush subsequently selected the Hyper3D model and explicitly requested its installation. The optimized Rodin GLB is now served from `public/assets/avatar/piyush-bust.glb` and configured in `src/avatarAsset.js`. The approved reference portrait was subsequently removed from public assets at Piyush’s request. It is retained only in ignored local reference output; no photo is rendered while the model loads or when WebGL is unavailable. The source service asset remains private; the website serves its own exported file. The ignored source export remains available for future optimization. No new generation, purchase or upload was needed for this selection.

The model is an approximate generated likeness rather than a measured facial scan. The approved bust is included in the React publication prepared for the public portfolio.
