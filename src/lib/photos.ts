const ids = [
  '1552674605-db6ffd4facb5', '1517649763962-0c623066013b', '1461896836934-ffe607ba8211',
  '1541252260730-0412e8e2108e', '1530549387789-4c1017266635', '1544919982-b61976f0ba43',
  '1571019613454-1cb2f99b2d8b', '1526676037777-05a232554f77', '1594737625785-a6cbdabd333c',
  '1554068865-24cecd4e34b8',
]
export const photo = (i: number, w = 600) =>
  `https://images.unsplash.com/photo-${ids[i % ids.length]}?auto=format&fit=crop&w=${w}&q=70`
export const PHOTO_COUNT = ids.length
