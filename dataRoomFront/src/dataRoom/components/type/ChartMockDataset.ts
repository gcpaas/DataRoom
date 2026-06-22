/**
 * Component mock dataset definition.
 *
 * dataset is the raw sample data shown in the data sample dialog and reused
 * by components as their design-time default data when no dataset is configured.
 *
 * fields maps component dataset field names to fields in dataset rows.
 */
export interface ChartMockDataset {
  dataset: unknown[]
  fields: ChartMockDatasetField[]
}

export interface ChartMockDatasetField {
  name: string
  bindName: string
}
