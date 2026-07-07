INSERT INTO effects (id, name, description, prompt, is_active)
VALUES
  (
    'cartoon',
    'Cartoon',
    'Clean cartoon style effect',
    'Transform this photo into a polished cartoon illustration. Preserve the person identity, face structure, pose, clothing, and background composition. Use clean outlines, smooth colors, soft shading, and a friendly modern cartoon look. Do not add extra people or text.',
    1
  ),
  (
    'anime',
    'Anime',
    'Anime portrait style',
    'Transform this photo into a high-quality anime style portrait. Preserve identity, facial expression, pose, outfit, and overall scene. Use expressive eyes, clean line art, detailed hair, soft cinematic lighting, and vibrant colors. Do not change the number of people.',
    1
  ),
  (
    'cinematic',
    'Cinematic',
    'Cinematic color grade',
    'Transform this photo with a cinematic film look. Preserve the original subject and composition. Add professional color grading, realistic lighting, shallow depth of field, subtle contrast, and a premium movie still atmosphere. Keep it natural and realistic.',
    1
  ),
  (
    'sketch',
    'Sketch',
    'Pencil sketch effect',
    'Transform this photo into a detailed pencil sketch. Preserve the subject identity, facial features, pose, and composition. Use fine graphite lines, realistic shading, paper texture, and hand-drawn detail. Keep the result clean and elegant.',
    1
  ),
  (
    'watercolor',
    'Watercolor',
    'Soft watercolor painting',
    'Transform this photo into a soft watercolor painting. Preserve the subject identity and composition. Use gentle brush strokes, transparent pigments, light paper texture, pastel tones, and artistic edges. Keep faces recognizable and natural.',
    1
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  prompt = VALUES(prompt),
  is_active = VALUES(is_active);
