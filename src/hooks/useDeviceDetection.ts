import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenWidth: 1920,
    screenHeight: 1080,
    userAgent: '',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // 터치 디바이스 감지
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 || 
                           navigator.maxTouchPoints > 0;

      // 모바일 디바이스 감지 (User Agent + 화면 크기)
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isMobileScreen = width < 768; // Tailwind의 md 브레이크포인트
      const isMobile = isMobileUA || (isMobileScreen && isTouchDevice);

      // 태블릿 감지
      const isTabletUA = /ipad|android(?!.*mobile)/i.test(userAgent);
      const isTabletScreen = width >= 768 && width < 1024; // md to lg
      const isTablet = isTabletUA || (isTabletScreen && isTouchDevice && !isMobile);

      // 데스크톱
      const isDesktop = !isMobile && !isTablet;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenWidth: width,
        screenHeight: height,
        userAgent,
      });
    };

    // 초기 설정
    updateDeviceInfo();

    // 화면 크기 변경 감지
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// 추가적인 유틸리티 함수들
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (width < 768 || /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  
  if (width < 1024 || /ipad|android(?!.*mobile)/i.test(userAgent)) {
    return 'tablet';
  }
  
  return 'desktop';
};

export const isMobileDevice = (): boolean => {
  return getDeviceType() === 'mobile';
};

export const isDesktopDevice = (): boolean => {
  return getDeviceType() === 'desktop';
};