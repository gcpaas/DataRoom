import type { DatasetType } from './api'

const STREAMING_DATASET_TYPES = new Set<string>(['websocket', 'mqtt'])

export const isStreamingDatasetType = (datasetType?: DatasetType | string) => {
  return !!datasetType && STREAMING_DATASET_TYPES.has(datasetType)
}
