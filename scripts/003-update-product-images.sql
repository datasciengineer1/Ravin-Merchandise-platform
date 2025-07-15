-- Update existing products with placeholder image URLs
UPDATE products
SET image_url = CASE sku
  WHEN 'PDJ-001' THEN '/placeholder.svg?height=100&width=100'
  WHEN 'CS-002' THEN '/placeholder.svg?height=100&width=100'
  WHEN 'GTS-003' THEN '/placeholder.svg?height=100&width=100'
  WHEN 'LW-004' THEN '/placeholder.svg?height=100&width=100'
  WHEN 'SH-005' THEN '/placeholder.svg?height=100&width=100'
  WHEN 'WS-006' THEN '/placeholder.svg?height=100&width=100'
  WHEN 'SG-007' THEN '/placeholder.svg?height=100&width=100'
  ELSE NULL
END
WHERE image_url IS NULL;