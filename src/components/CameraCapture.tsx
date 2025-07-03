import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  Camera,
  X,
  RotateCcw,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function CameraCapture({
  onCapture,
  onClose,
  disabled = false,
}: CameraCaptureProps) {
  // React Native Expo Camera와 동일한 단순한 상태 관리
  const [hasPermission, setHasPermission] = useState<
    boolean | null
  >(null);
  const [stream, setStream] = useState<MediaStream | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraType, setCameraType] = useState<
    "user" | "environment"
  >("environment");
  const [videoReady, setVideoReady] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    width: number;
    height: number;
    playing: boolean;
  }>({ width: 0, height: 0, playing: false });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // React Native의 requestCameraPermissionsAsync와 동일한 함수
  const requestCameraPermission =
    async (): Promise<boolean> => {
      try {
        console.log("📸 카메라 권한 요청 시작...");

        // 단순한 권한 테스트 (React Native 스타일)
        const testStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });

        // 즉시 정리 (테스트용)
        testStream.getTracks().forEach((track) => track.stop());

        console.log("✅ 카메라 권한 승인됨");
        setHasPermission(true);
        return true;
      } catch (err) {
        console.error("❌ 카메라 권한 거부됨:", err);
        setHasPermission(false);

        const error = err as Error;
        if (error.name === "NotAllowedError") {
          setError(
            "카메라 권한이 필요합니다.\n브라우저 설정에서 카메라 접근을 허용해주세요.",
          );
        } else if (error.name === "NotFoundError") {
          setError(
            "카메라를 찾을 수 없습니다.\n카메라가 연결되어 있는지 확인해주세요.",
          );
        } else {
          setError(`카메라 오류: ${error.message}`);
        }
        return false;
      }
    };

  // 비디오 요소에 스트림 연결 (확실한 방식)
  const connectStreamToVideo = useCallback(
    (mediaStream: MediaStream) => {
      console.log("📹 비디오 요소에 스트림 연결 시작...");
      const video = videoRef.current;
      if (!video) {
        console.error("❌ 비디오 요소를 찾을 수 없음");
        return false;
      }

      try {
        console.log("📹 비디오 요소에 스트림 연결 시작...");

        // 기존 스트림 정리
        if (video.srcObject) {
          const oldStream = video.srcObject as MediaStream;
          oldStream
            .getTracks()
            .forEach((track) => track.stop());
        }

        // 비디오 요소 속성 설정 (React Native처럼 확실하게)
        video.srcObject = mediaStream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.controls = false;

        // 모바일 브라우저를 위한 추가 속성
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.setAttribute("muted", "true");

        console.log("📹 비디오 요소 속성 설정 완료:", {
          srcObject: !!video.srcObject,
          autoplay: video.autoplay,
          playsInline: video.playsInline,
          muted: video.muted,
        });

        // 비디오 이벤트 리스너 설정
        const handleLoadedMetadata = () => {
          console.log("📹 비디오 메타데이터 로드됨:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
          });

          setVideoInfo({
            width: video.videoWidth,
            height: video.videoHeight,
            playing: !video.paused,
          });

          setVideoReady(true);
        };

        const handleCanPlay = () => {
          console.log("📹 비디오 재생 준비 완료");
          setVideoReady(true);
        };

        const handlePlay = () => {
          console.log("▶️ 비디오 재생 시작됨");
          setVideoInfo((prev) => ({ ...prev, playing: true }));
        };

        const handlePause = () => {
          console.log("⏸️ 비디오 일시정지됨");
          setVideoInfo((prev) => ({ ...prev, playing: false }));
        };

        const handleError = (event: Event) => {
          console.error("❌ 비디오 오류:", event);
          setError("비디오 재생 중 오류가 발생했습니다.");
        };

        // 이벤트 리스너 추가
        video.addEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("error", handleError);

        // 비디오 재생 시작 (더 강력한 방식)
        const startVideoPlayback = async () => {
          try {
            console.log("▶️ 비디오 재생 시도...");
            await video.play();
            console.log("✅ 비디오 재생 성공");
            setVideoInfo((prev) => ({
              ...prev,
              playing: true,
            }));
          } catch (playError) {
            console.warn("⚠️ 자동 재생 실패:", playError);
            // 자동 재생 실패해도 스트림은 연결된 상태
            console.log("🔄 사용자 인터랙션으로 재생 가능");
          }
        };

        // 짧은 지연 후 재생 시작
        setTimeout(startVideoPlayback, 100);

        // 정리 함수 반환
        return () => {
          video.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata,
          );
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("play", handlePlay);
          video.removeEventListener("pause", handlePause);
          video.removeEventListener("error", handleError);
        };
      } catch (err) {
        console.error("❌ 비디오 스트림 연결 실패:", err);
        return false;
      }
    },
    [],
  );

  // React Native Expo Camera처럼 단순한 카메라 시작
  const startCamera = useCallback(async () => {
    // 권한이 없으면 먼저 요청
    if (hasPermission !== true) {
      const granted = await requestCameraPermission();
      if (!granted) return;
    }

    try {
      setError(null);
      setVideoReady(false);
      console.log("📸 카메라 시작...", { cameraType });

      // 기존 스트림 정리
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      // 단순한 카메라 설정 (React Native 스타일)
      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraType,
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
          audio: false,
        });

      console.log("✅ 카메라 스트림 획득:", {
        tracks: mediaStream.getTracks().length,
        videoTrack: mediaStream
          .getVideoTracks()[0]
          ?.getSettings(),
      });

      // 스트림을 상태에 저장
      setStream(mediaStream);

      // 비디오 요소에 스트림 연결 (확실한 방식)
      connectStreamToVideo(mediaStream);

      console.log("✅ 카메라 초기화 완료");
    } catch (err) {
      console.error("❌ 카메라 시작 실패:", err);
      const error = err as Error;

      if (error.name === "NotAllowedError") {
        setError(
          "카메라 권한이 거부되었습니다.\n브라우저 설정에서 카메라 접근을 허용해주세요.",
        );
        setHasPermission(false);
      } else if (error.name === "NotFoundError") {
        setError(
          "카메라를 찾을 수 없습니다.\n카메라가 연결되어 있는지 확인해주세요.",
        );
      } else if (error.name === "OverconstrainedError") {
        setError(
          "요청한 카메라 설정을 지원하지 않습니다.\n다른 카메라를 시도해보세요.",
        );
      } else {
        setError(`카메라 시작 실패: ${error.message}`);
      }
    }
  }, [hasPermission, cameraType, stream, connectStreamToVideo]);

  // 스트림이 변경될 때 비디오 요소에 다시 연결
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log(
        "🔄 스트림이 변경됨, 비디오 요소에 재연결...",
      );
      connectStreamToVideo(stream);
    }
  }, [stream, connectStreamToVideo]);

  // React Native의 changeType과 동일한 카메라 전환
  const changeType = useCallback(async () => {
    const newCameraType =
      cameraType === "user" ? "environment" : "user";
    console.log(
      "🔄 카메라 전환:",
      cameraType,
      "->",
      newCameraType,
    );
    setCameraType(newCameraType);

    // 짧은 지연 후 카메라 재시작
    setTimeout(() => {
      if (stream) {
        startCamera();
      }
    }, 100);
  }, [cameraType, stream, startCamera]);

  // React Native의 takePictureAsync와 동일한 촬영 함수
  const takePicture = useCallback(async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !stream ||
      isCapturing
    ) {
      console.error("❌ 촬영 준비 안됨:", {
        videoElement: !!videoRef.current,
        canvasElement: !!canvasRef.current,
        stream: !!stream,
        videoReady,
        isCapturing,
      });
      return;
    }

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context를 가져올 수 없습니다.");
      }

      // 비디오 크기 확인
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("비디오가 아직 준비되지 않았습니다.");
      }

      // 캔버스 크기 설정
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log("📸 사진 촬영:", {
        videoSize: `${video.videoWidth}x${video.videoHeight}`,
        canvasSize: `${canvas.width}x${canvas.height}`,
        readyState: video.readyState,
        currentTime: video.currentTime,
      });

      // 비디오 프레임을 캔버스에 그리기
      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      // Blob으로 변환
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("이미지 생성 실패");
      }

      // File 객체 생성 (React Native의 photo.uri와 유사)
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const fileName = `camera-${cameraType}-${timestamp}.jpg`;

      const file = new File([blob], fileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      console.log("✅ 사진 촬영 완료:", {
        fileName: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        dimensions: `${canvas.width}x${canvas.height}`,
      });

      // 촬영 플래시 효과
      if (videoRef.current?.parentElement) {
        const flash = document.createElement("div");
        flash.className =
          "absolute inset-0 bg-white opacity-80 pointer-events-none z-50";
        videoRef.current.parentElement.appendChild(flash);

        setTimeout(() => {
          flash.remove();
        }, 150);
      }

      // 콜백 호출 (React Native의 callback과 유사)
      onCapture(file);

      // 자동으로 카메라 종료 및 닫기
      setTimeout(() => {
        stopCamera();
        onClose();
      }, 200);
    } catch (err) {
      console.error("❌ 사진 촬영 오류:", err);
      setError(`촬영 오류: ${(err as Error).message}`);
    } finally {
      setIsCapturing(false);
    }
  }, [
    stream,
    cameraType,
    isCapturing,
    videoReady,
    onCapture,
    onClose,
  ]);

  // 카메라 중지 (React Native의 컴포넌트 언마운트와 유사)
  const stopCamera = useCallback(() => {
    console.log("🛑 카메라 중지");
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setVideoReady(false);
    setVideoInfo({ width: 0, height: 0, playing: false });
  }, [stream]);

  // React Native useEffect와 동일한 초기화
  useEffect(() => {
    if (!disabled) {
      console.log("🚀 CameraCapture 마운트됨");
      requestCameraPermission().then((granted) => {
        if (granted) {
          // 짧은 지연을 두어 컴포넌트가 완전히 마운트된 후 시작
          setTimeout(() => {
            startCamera();
          }, 500);
        }
      });
    }

    // 컴포넌트 언마운트 시 정리 (React Native와 동일)
    return () => {
      console.log("🧹 CameraCapture 언마운트됨");
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [disabled]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // 비디오 수동 재생 (자동 재생 실패 시)
  const handleVideoClick = useCallback(async () => {
    if (videoRef.current && stream && !videoInfo.playing) {
      try {
        await videoRef.current.play();
        console.log("✅ 수동 비디오 재생 성공");
      } catch (err) {
        console.error("❌ 수동 비디오 재생 실패:", err);
      }
    }
  }, [stream, videoInfo.playing]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex-shrink-0 p-4 bg-black/90 backdrop-blur-sm border-b border-white/10 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-white" />
              <h2 className="font-semibold text-white">
                카메라
              </h2>

              {/* 권한 상태 표시 (React Native 스타일) */}
              {hasPermission === null && (
                <div className="flex items-center gap-2 text-sm text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                  <span>권한 확인 중</span>
                </div>
              )}

              {hasPermission === false && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>권한 필요</span>
                </div>
              )}

              {hasPermission === true &&
                stream &&
                videoReady && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>활성화됨</span>
                  </div>
                )}
            </div>

            <div className="flex items-center gap-2">
              {/* 카메라 전환 버튼 (React Native의 changeType과 유사) */}
              {stream && videoReady && (
                <Button
                  onClick={changeType}
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-white hover:bg-white/10"
                  disabled={disabled || isCapturing}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}

              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="rounded-full text-white hover:bg-white/10"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 디버깅 정보 (개발용) */}
          {stream && (
            <div className="mt-2 text-xs text-white/60 bg-black/30 px-2 py-1 rounded">
              {videoReady ? "🟢" : "🟡"} 비디오:{" "}
              {videoInfo.width}x{videoInfo.height} |{" "}
              {videoInfo.playing ? "▶️ 재생 중" : "⏸️ 정지됨"} |{" "}
              {cameraType === "environment" ? "후면" : "전면"}{" "}
              카메라
            </div>
          )}
        </div>

        {/* 카메라 영역 */}
        <div className="flex-1 relative overflow-hidden bg-black">
          {hasPermission === false ? (
            // 권한 요청 화면
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-sm mx-4 bg-gray-900 border-gray-700">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                  <h3 className="font-semibold mb-2 text-white">
                    카메라 권한이 필요합니다
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    사진을 촬영하려면 카메라 접근 권한을
                    허용해주세요
                  </p>
                  <Button
                    onClick={requestCameraPermission}
                    className="gradient-primary glow-primary w-full"
                    disabled={disabled}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    권한 허용
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : hasPermission === null ? (
            // 권한 확인 중
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-white text-lg font-medium mb-2">
                  권한 확인 중...
                </p>
                <p className="text-white/70 text-sm">
                  카메라 접근 권한을 확인하고 있습니다
                </p>
              </div>
            </div>
          ) : error ? (
            // 오류 화면
            <div className="h-full flex items-center justify-center p-4">
              <Card className="max-w-md mx-auto bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <Alert className="border-red-500/20 bg-red-500/10 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <AlertDescription className="text-red-300 text-sm whitespace-pre-line">
                      {error}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-white hover:bg-gray-800"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      다시 시도
                    </Button>

                    <Button
                      onClick={handleClose}
                      variant="secondary"
                      size="sm"
                      className="w-full bg-gray-700 text-white hover:bg-gray-600"
                    >
                      닫기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : !stream || !videoReady ? (
            // 카메라 시작 중
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-white text-lg font-medium mb-2">
                  카메라 시작 중...
                </p>
                <p className="text-white/70 text-sm">
                  {cameraType === "environment"
                    ? "후면 카메라"
                    : "전면 카메라"}{" "}
                  준비 중
                </p>
                {stream && !videoReady && (
                  <p className="text-white/50 text-xs mt-2">
                    비디오 로드 중...
                  </p>
                )}
              </div>
            </div>
          ) : (
            // 카메라 미리보기 (핵심 부분 - React Native처럼 단순하게)
            <>
              {/* 비디오 요소 - 매우 단순하고 확실하게 */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover bg-black cursor-pointer"
                autoPlay
                playsInline
                muted
                onClick={handleVideoClick}
                style={{
                  // 확실한 표시를 위한 스타일
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  backgroundColor: "#000",
                  display: "block",
                }}
              />

              {/* 비디오가 재생되지 않을 때 클릭 안내 */}
              {!videoInfo.playing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">
                      화면을 터치하세요
                    </p>
                    <p className="text-white/70 text-sm">
                      카메라를 시작하려면 화면을 터치해주세요
                    </p>
                  </div>
                </div>
              )}

              {/* 촬영 가이드 */}
              <div className="absolute inset-0 pointer-events-none">
                {/* 가이드 프레임 */}
                <div className="absolute inset-8 border-2 border-white/60 rounded-3xl">
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-l-3 border-t-3 border-white rounded-tl-lg"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 border-r-3 border-t-3 border-white rounded-tr-lg"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-3 border-b-3 border-white rounded-bl-lg"></div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-3 border-b-3 border-white rounded-br-lg"></div>
                </div>

                {/* 안내 텍스트 */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/70 px-4 py-2 rounded-full border border-white/20">
                    <p className="text-sm text-white">
                      약물을 프레임 안에 맞춰주세요
                    </p>
                  </div>
                </div>

                {/* 촬영 중 오버레이 */}
                {isCapturing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-black/80 px-6 py-4 rounded-xl border border-white/20">
                      <div className="flex items-center gap-3 text-white">
                        <Zap className="w-5 h-5 animate-pulse" />
                        <span>촬영 중...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 하단 컨트롤 (React Native 스타일) */}
        {stream && videoReady && (
          <div className="flex-shrink-0 p-6 bg-black/90 backdrop-blur-sm border-t border-white/10">
            <div className="flex items-center justify-center gap-8">
              <Button
                onClick={handleClose}
                variant="outline"
                size="lg"
                className="rounded-full px-6 border-white/30 text-white hover:bg-white/10"
                disabled={disabled || isCapturing}
              >
                취소
              </Button>

              {/* 촬영 버튼 (React Native의 takePicture 버튼과 유사) */}
              <div className="relative">
                <Button
                  onClick={takePicture}
                  className="w-20 h-20 rounded-full bg-white hover:bg-white/90 p-0 shadow-lg"
                  disabled={
                    disabled ||
                    isCapturing ||
                    !videoInfo.playing
                  }
                >
                  {isCapturing ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-16 h-16 bg-white border-4 border-gray-800 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                    </div>
                  )}
                </Button>

                {!isCapturing && videoInfo.playing && (
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-lg -z-10 animate-pulse"></div>
                )}
              </div>

              <Button
                onClick={changeType}
                variant="outline"
                size="lg"
                className="rounded-full px-6 border-white/30 text-white hover:bg-white/10"
                disabled={disabled || isCapturing}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* 상태 표시 */}
            <div className="mt-4 text-center">
              <div className="text-xs text-white/70 space-y-1">
                <div>
                  •{" "}
                  {videoInfo.playing
                    ? "큰 원을 눌러 사진 촬영"
                    : "화면을 터치하여 카메라 시작"}
                </div>
                <div>• 우측 버튼으로 카메라 전환</div>
                <div>
                  • 현재:{" "}
                  {cameraType === "environment"
                    ? "후면 카메라"
                    : "전면 카메라"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 촬영용 숨겨진 캔버스 */}
      <canvas
        ref={canvasRef}
        className="absolute -top-full opacity-0 pointer-events-none"
      />
    </div>
  );
}