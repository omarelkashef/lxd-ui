export interface ImageRegistryFormValues {
  name: string;
  public: boolean;
  protocol: string;
  description?: string;
  url?: string;
  cluster?: string;
  source_project?: string;
  //add user.
}
