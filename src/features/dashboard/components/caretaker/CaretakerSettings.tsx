"use client";

import { updateCaretaker, getCaretaker } from "@/features/auth/actions";
import { getEmailTemplate } from "@/lib/email-template";
import { sendTestNotification } from "@/features/notifications/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Mail, Bell, Clock, Save, ActivityIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const CaretakerSettings = ({
  patientName = "Patient",
}: {
  patientName?: string;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";
  // caretaker email
  const [email, setEmail] = useState("");
  // loading state
  const [loading, setLoading] = useState(false);
  //
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [missedAlertsEnabled, setMissedAlertsEnabled] = useState(true);
  const [alertWindow, setAlertWindow] = useState(120);
  const [testingEmail, setTestingEmail] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(100);
  const [errors, setErrors] = useState<{
    email?: string;
    alertWindow?: string;
  }>({});

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "resize") {
        setIframeHeight(event.data.height);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!alertWindow || alertWindow < 5) {
      newErrors.alertWindow = "Minimum 5 minutes required";
    } else if (alertWindow > 1440) {
      newErrors.alertWindow = "Maximum 24 hours (1440 min)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    async function fetchCaretakerSettings() {
      const result = await getCaretaker();
      if (result.email) setEmail(result.email);
      setNotificationsEnabled(result.notificationsEnabled);
      setMissedAlertsEnabled(result.missedAlertsEnabled);
      setAlertWindow(result.alertWindow);
    }
    fetchCaretakerSettings();
  }, []);

  const handleUpdate = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setLoading(true);
    const result = await updateCaretaker({
      email,
      notificationsEnabled,
      missedAlertsEnabled,
      alertWindow,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Notification settings updated!");
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    const result = await sendTestNotification();
    setTestingEmail(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Verification email sent!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-8">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Manage how and when you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-muted/10">
              <div className="space-y-0.5">
                <Label className="text-base text-foreground/90">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground/70">
                  Receive medication alerts via email
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(val) => {
                  setNotificationsEnabled(val);
                  setMissedAlertsEnabled(val);
                }}
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="caretaker-email"
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                  errors.email ? "text-red-500" : "text-muted-foreground/80",
                )}
              >
                Delivery Inbox
              </Label>
              <div className="relative">
                <Mail
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                    errors.email ? "text-red-500/60" : "text-primary/40",
                  )}
                />
                <Input
                  id="caretaker-email"
                  className={cn(
                    "pl-10 h-12 bg-background/50 border-muted/20 focus-visible:ring-primary/20 transition-all rounded-xl",
                    errors.email &&
                      "border-red-500/50 focus-visible:ring-red-500/20",
                  )}
                  placeholder="caretaker@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 font-bold tracking-tight animate-in fade-in slide-in-from-top-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-muted/10">
              <div className="space-y-0.5">
                <Label className="text-base text-foreground/90">
                  Missed Medication Alerts
                </Label>
                <p className="text-xs text-muted-foreground/70">
                  Get notified when medication is not taken on time
                </p>
              </div>
              <Switch
                checked={missedAlertsEnabled}
                onCheckedChange={(val) => {
                  setMissedAlertsEnabled(val);
                  setNotificationsEnabled(val);
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    errors.alertWindow
                      ? "text-red-500"
                      : "text-muted-foreground/80",
                  )}
                >
                  Alert Window (Min)
                </Label>
                <div className="relative">
                  <Clock
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                      errors.alertWindow
                        ? "text-red-500/60"
                        : "text-primary/40",
                    )}
                  />
                  <Input
                    type="number"
                    min={5}
                    value={alertWindow}
                    onChange={(e) => {
                      setAlertWindow(parseInt(e.target.value));
                      if (errors.alertWindow)
                        setErrors((prev) => ({
                          ...prev,
                          alertWindow: undefined,
                        }));
                    }}
                    className={cn(
                      "pl-10 h-12 bg-background/50 border-muted/20 rounded-xl w-full",
                      errors.alertWindow &&
                        "border-red-500/50 focus-visible:ring-red-500/20",
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "text-[10px] italic transition-colors",
                    errors.alertWindow
                      ? "text-red-500 font-bold"
                      : "text-muted-foreground/60",
                  )}
                >
                  {errors.alertWindow ||
                    "Minutes before alerts switch to 'Missed'..."}
                </p>
              </div>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full gap-2 py-6 h-auto shadow-xl shadow-primary/10 rounded-xl font-bold uppercase tracking-widest text-xs"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving Changes..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>

        {false && (
          <div className="p-6 rounded-2xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/10">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <ActivityIcon className="h-4 w-4" />
              System Diagnostics
            </h3>
            <p className="text-xs text-muted-foreground/80 mb-4 leading-relaxed">
              Send a real test notification to{" "}
              <span className="font-bold text-foreground">
                {email || "your inbox"}
              </span>{" "}
              to ensure deliverability.
            </p>
            <Button
              variant="outline"
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="w-full text-amber-600 border-amber-500/20 hover:bg-amber-500/10 gap-2 h-11 rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              <Mail className="h-4 w-4" />
              {testingEmail ? "Verifying..." : "Send Test Notification"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8 bg-card/30 backdrop-blur-md rounded-3xl p-8 shadow-sm h-fit">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-1.5">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  className="size-4 text-primary"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11 2l-.15 .005a2 2 0 0 0 -1.85 1.995v2.803l-2.428 -1.401a2 2 0 0 0 -2.732 .732l-1 1.732l-.073 .138a2 2 0 0 0 .805 2.594l2.427 1.402l-2.427 1.402a2 2 0 0 0 -.732 2.732l1 1.732l.083 .132a2 2 0 0 0 2.649 .6l2.428 -1.402v2.804a2 2 0 0 0 2 2h2l.15 -.005a2 2 0 0 0 1.85 -1.995v-2.804l2.428 1.403a2 2 0 0 0 2.732 -.732l1 -1.732l.073 -.138a2 2 0 0 0 -.805 -2.594l-2.428 -1.403l2.428 -1.402a2 2 0 0 0 .732 -2.732l-1 -1.732l-.083 -.132a2 2 0 0 0 -2.649 -.6l-2.428 1.4v-2.802a2 2 0 0 0 -2 -2h-2z"></path>
                </svg>
              </div>
              <span className="font-bold font-heading text-sm tracking-tight">
                Medi Care
              </span>
            </div>
            <div className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest">
              Live
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pb-6">
            <div className="space-y-1.5 ">
              <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-tighter">
                Subject Line
              </span>
              <p className="text-sm font-bold text-foreground leading-tight">
                ⚠️ Action Required: Missed Medication Alert - {patientName}
              </p>
            </div>
            <div className="space-y-1.5 ">
              <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-tighter">
                Recipient
              </span>
              <div className="flex">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                  {email || "caretaker@example.com"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl">
          <iframe
            key={`${isDark}`}
            srcDoc={getEmailTemplate({
              patientName: patientName,
              medicationName: "Lisinopril",
              dosage: "10mg",
              time: "10:30 AM",
              type: "missed",
            })
              .replace(
                "</body>",
                `<script>
                function updateHeight() {
                  const height = document.body.getBoundingClientRect().height;
                  window.parent.postMessage({ height: height, type: 'resize' }, '*');
                }
                window.onload = updateHeight;
                const observer = new ResizeObserver(updateHeight);
                observer.observe(document.body);
                setInterval(updateHeight, 500);
              </script></body>`,
              )
              .replace(
                "</head>",
                `<style>
                  ${
                    isDark
                      ? `
                    .body-bg { background-color: transparent !important; }
                    .card-bg { background-color: #0f172a !important; border-color: #1e293b !important; }
                    .text-main { color: #f1f5f9 !important; }
                    .text-muted { color: #94a3b8 !important; }
                    .text-heading { color: #ffffff !important; }
                    .border-light { border-color: #1e293b !important; }
                    .inner-card { background-color: #1e293b !important; border-color: #7f1d1d !important; }
                    .inner-header { background-color: #450a0a !important; border-color: #7f1d1d !important; }
                    .text-inner-heading { color: #fecaca !important; }
                    .text-inner-muted { color: #ef4444 !important; }
                  `
                      : ".body-bg { background-color: transparent !important; }"
                  }
                  /* Remove outer margins for better fit */
                  .card-bg { box-shadow: none !important; margin: 0 auto !important; }
                  body { margin: 0 !important; padding: 0 !important; overflow: hidden; }
                </style></head>`,
              )}
            className="w-full border-none block bg-transparent"
            title="Email Preview"
            scrolling="no"
            style={{
              height: `${iframeHeight}px`,
              transition: "height 0.3s ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CaretakerSettings;
