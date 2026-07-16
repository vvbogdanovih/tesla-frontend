import type { CatalogImage } from '@/common/types'

// Джерело для мініатюр (картки, прайс-лист, стрічки превʼю): 400px-варіант
// `<uuid>_w400.avif` з бекенда (ADR-0007); фолбек на повний `url`,
// поки бекенд не віддає thumbUrl для старих зображень
export const thumbSrc = (img: CatalogImage) => img.thumbUrl ?? img.url
