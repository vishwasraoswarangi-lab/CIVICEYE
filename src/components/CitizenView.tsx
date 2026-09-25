import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Smartphone,
  Navigation,
  Clock,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Send,
  XCircle,
  Car,
  ListFilter,
} from 'lucide-react';
import { AIAnalysisResult, ParkingCase } from '../types';
import { PRESET_SAMPLES, PresetSample } from '../sampleData';
import { CivicEyeLogo } from './CivicEyeLogo';

interface CitizenViewProps {
  cases: ParkingCase[];
  onCaseSubmitted: (newCase: ParkingCase) => void;
}

export const CitizenView: React.FC<CitizenViewProps> = ({
  cases,
  onCaseSubmitted,
}) => {
  const [citizenTab, setCitizenTab] = useState<'snap' | 'my-reports'>('snap');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locationName, setLocationName] = useState<string>('Market St & 5th Ave (Zone 3)');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 37.7749,
    lng: -122.4194,
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedCase, setSubmittedCase] = useState<ParkingCase | null>(null);

  // Keep track of cases reported by this citizen session
  const [myReportIds, setMyReportIds] = useState<string[]>(['CASE-8921', 'CASE-8922']);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setCoordinates({ lat, lng });
          setLocationName(`4th Ave & Pine St (GPS: ${lat}, ${lng})`);
        },
        () => {
          setLocationName('5th Ave & Market St (Central District)');
        },
        { timeout: 4000 }
      );
    }
  }, []);

  const startCamera = async () => {
    try {
      setSubmittedCase(null);
      setAiResult(null);
      setImagePreview(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      stopCamera();
      runAnalysis(dataUrl, locationName);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmittedCase(null);
    setAiResult(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      runAnalysis(dataUrl, locationName);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: PresetSample) => {
    stopCamera();
    setSubmittedCase(null);
    setImagePreview(sample.imageUrl);
    setLocationName(sample.location);
    setCoordinates(sample.coordinates);

    setIsAnalyzing(true);
    setTimeout(() => {
      setAiResult(sample.defaultAnalysis);
      setIsAnalyzing(false);
    }, 800);
  };

  const runAnalysis = async (imageDataUrl: string, locName: string) => {
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/analyze-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: 'image/jpeg',
          locationHint: locName,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiResult(data.analysis);
      }
    } catch {
      setAiResult({
        isViolation: true,
        violationType: 'Parked in No-Parking Red Zone',
        confidenceScore: 97,
        vehicleMakeModel: 'Silver Sedan',
        licensePlate: '7XYZ492',
        proofSummary: 'Vehicle parked flush along red painted curb near hydrant.',
        locationDescription: locName,
        suggestedFine: 85,
        penaltyCode: 'CIV-302',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!aiResult || !imagePreview) return;
    setIsSubmitting(true);

    try {
      const payload = {
        imageUrl: imagePreview,
        location: locationName,
        coordinates,
        vehicleDetails: {
          makeModel: aiResult.vehicleMakeModel,
          licensePlate: aiResult.licensePlate,
        },
        violationType: aiResult.violationType,
        isViolation: aiResult.isViolation,
        confidenceScore: aiResult.confidenceScore,
        proofSummary: aiResult.proofSummary,
        fineAmount: aiResult.suggestedFine,
        penaltyCode: aiResult.penaltyCode,
      };

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.case) {
        setSubmittedCase(data.case);
        setMyReportIds((prev) => [data.case.id, ...prev]);
        onCaseSubmitted(data.case);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    stopCamera();
    setImagePreview(null);
    setAiResult(null);
    setSubmittedCase(null);
  };

  // Filter cases that belong to "My Reports"
  const myReports = cases.filter(
    (c) => myReportIds.includes(c.id) || c.id === submittedCase?.id
  );

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-3xl border border-sky-200/80 shadow-md overflow-hidden flex flex-col">
      {/* Light Blue App Header (Replaces dark header) */}
      <div className="bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 border-b border-sky-200 px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CivicEyeLogo className="w-7 h-7 rounded-lg shrink-0 shadow-2xs" />
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                CivicEye
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-sky-700 mt-0.5">
                Citizen Reporter App
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/90 border border-sky-200 px-2 py-1 rounded-full text-[10px] text-emerald-700 font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            GPS ACTIVE
          </div>
        </div>

        {/* Citizen Mode Switcher: Snap vs My Reports */}
        <div className="mt-3 flex items-center bg-white/80 p-0.5 rounded-xl border border-sky-200 text-xs">
          <button
            onClick={() => setCitizenTab('snap')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              citizenTab === 'snap'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Snap Photo
          </button>

          <button
            onClick={() => setCitizenTab('my-reports')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all relative ${
              citizenTab === 'my-reports'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            My Reports
            {myReports.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                citizenTab === 'my-reports'
                  ? 'bg-white text-sky-800'
                  : 'bg-sky-100 text-sky-800'
              }`}>
                {myReports.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Citizen Body */}
      <div className="p-4 space-y-3.5 flex-1 bg-slate-50/50">
        {citizenTab === 'snap' ? (
          <>
            {/* Auto Location Pill */}
            <div className="flex items-center justify-between bg-sky-50/70 border border-sky-200/70 px-3 py-2 rounded-xl text-xs text-slate-700 shadow-2xs">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">{locationName}</span>
              </span>
              <span className="text-[10px] text-sky-700 bg-white px-1.5 py-0.5 rounded border border-sky-200 shrink-0 font-mono font-medium">
                AUTO-TAG
              </span>
            </div>

            {/* Case Submitted Confirmation */}
            {submittedCase ? (
              <div className="bg-white border border-emerald-200 rounded-2xl p-5 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Report Submitted!
                  </h3>
                  <p className="text-xs font-mono text-emerald-800 font-semibold mt-0.5">
                    Case ID: {submittedCase.id}
                  </p>
                </div>
                <p className="text-xs text-slate-600">
                  AI proof and vehicle location have been dispatched to the municipal traffic enforcement server.
                </p>

                {/* Tracking Progress Preview */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-left space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Live Status
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Sent to Authority Queue (Awaiting Go / No-Go)
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setCitizenTab('my-reports')}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Track in "My Reports" <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={resetAll}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    Report Another Car
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Photo Viewfinder / Upload Container */}
                <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 aspect-4/3 flex items-center justify-center shadow-xs">
                  {isCameraActive ? (
                    <div className="w-full h-full relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4">
                        <button
                          onClick={stopCamera}
                          className="px-3 py-1 bg-black/60 text-white text-xs rounded-full"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={capturePhoto}
                          className="w-12 h-12 rounded-full bg-white border-4 border-sky-500 shadow-md"
                        />
                      </div>
                    </div>
                  ) : imagePreview ? (
                    <div className="w-full h-full relative">
                      <img
                        src={imagePreview}
                        alt="Car photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={resetAll}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 text-white rounded-lg text-xs"
                      >
                        Retake
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-5 space-y-2.5">
                      <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-700 mx-auto flex items-center justify-center shadow-xs border border-sky-100">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        Snap or upload wrongly parked car
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-0.5">
                        <button
                          onClick={startCamera}
                          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" /> Camera
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="pt-2 text-left">
                        <span className="text-[10px] text-slate-400 block mb-1 text-center font-medium">
                          or choose test car:
                        </span>
                        <div className="flex gap-2 justify-center">
                          {PRESET_SAMPLES.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectSample(s)}
                              className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 hover:border-sky-500 relative shrink-0 transition-colors shadow-2xs"
                            >
                              <img
                                src={s.imageUrl}
                                alt={s.title}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Result Card */}
                {isAnalyzing && (
                  <div className="p-4 rounded-xl bg-white border border-sky-200 text-center space-y-1.5 shadow-2xs">
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin mx-auto" />
                    <div className="text-xs font-medium text-slate-700">
                      AI checking violation & proof...
                    </div>
                  </div>
                )}

                {!isAnalyzing && aiResult && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate max-w-[200px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{aiResult.violationType}</span>
                      </span>
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 shrink-0">
                        {aiResult.licensePlate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                      <strong className="text-slate-800">AI Proof:</strong> {aiResult.proofSummary}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Assessed Fine</span>
                      <span className="text-slate-900 font-bold">${aiResult.suggestedFine}</span>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>Submit Case to Authority</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* ======================================================== */
          /* My Reports & Status Tracking View                        */
          /* ======================================================== */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                My Reported Violations ({myReports.length})
              </span>
              <button
                onClick={() => setCitizenTab('snap')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                + Snap New
              </button>
            </div>

            {myReports.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  You haven't reported any parking violations yet.
                </p>
                <button
                  onClick={() => setCitizenTab('snap')}
                  className="px-3.5 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-semibold"
                >
                  Snap First Car
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myReports.map((report) => {
                  const isPending = report.status === 'PENDING_REVIEW';
                  const isValidated = report.status === 'VALIDATED';
                  const isDismissed = report.status === 'DISMISSED';

                  return (
                    <div
                      key={report.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all"
                    >
                      {/* Top Header of Report */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={report.imageUrl}
                            alt="Vehicle"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-slate-900">
                                {report.id}
                              </span>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                                {report.vehicleDetails.licensePlate}
                              </span>
                            </div>
                            <div className="text-xs text-slate-800 font-semibold line-clamp-1 mt-0.5">
                              {report.violationType}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                              {report.location}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 text-right">
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Under Review
                            </span>
                          )}
                          {isValidated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Validated
                            </span>
                          )}
                          {isDismissed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Dismissed
                            </span>
                          )}
                          <div className="text-[9px] text-slate-400 mt-1">
                            {report.timestamp}
                          </div>
                        </div>
                      </div>

                      {/* 4-Step Visual Status Tracker Bar */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                          <span className="font-semibold text-slate-700">Report Status Pipeline:</span>
                          {isValidated && (
                            <span className="text-emerald-700 font-bold">Fine Auto-Dispatched</span>
                          )}
                          {isPending && (
                            <span className="text-amber-700 font-semibold">Awaiting Go / No-Go</span>
                          )}
                          {isDismissed && (
                            <span className="text-rose-700 font-semibold">Closed Without Fine</span>
                          )}
                        </div>

                        {/* Step progress pills */}
                        <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
                          {/* Step 1: Citizen Submitted */}
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md py-1 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 1. Snapped
                          </div>

                          {/* Step 2: AI Verified */}
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md py-1 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 2. AI Proof
                          </div>

                          {/* Step 3: Authority Decision */}
                          <div
                            className={`rounded-md py-1 font-semibold flex items-center justify-center gap-1 border ${
                              isValidated
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : isDismissed
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                            }`}
                          >
                            {isValidated && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {isDismissed && <XCircle className="w-2.5 h-2.5" />}
                            {isPending && <Clock className="w-2.5 h-2.5" />}
                            3. {isValidated ? 'Go (Fined)' : isDismissed ? 'No-Go' : 'Reviewing'}
                          </div>
                        </div>

                        {/* Proof rationale */}
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                          <strong className="text-slate-700">AI Evidence:</strong> {report.proofSummary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Citizen App Bottom Bar */}
      <div className="bg-sky-50 border-t border-sky-100 px-4 py-2.5 text-center text-[10px] text-sky-800 font-medium">
        CivicEye Citizen Interface • Reports sync automatically to authority terminal
      </div>
    </div>
  );
};
