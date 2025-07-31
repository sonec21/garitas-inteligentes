declare module 'react-native-config' {
  export interface NativeConfig {
    GOOGLE_MAPS_API_KEY?: string;
    [name: string]: string | undefined;
  }

  export const Config: NativeConfig;
  export default Config;
}