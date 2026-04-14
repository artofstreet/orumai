import { useColorScheme as useColorSchemeRN } from 'react-native';

// react-native의 useColorScheme를 내부 alias로만 사용하고,
// 이 파일에서는 동일한 이름의 훅을 다시 export합니다.
export function useColorScheme() {
  return useColorSchemeRN();
}
