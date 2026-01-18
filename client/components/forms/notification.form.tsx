import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDown, Ghost, PlayCircle } from "lucide-react";
import { SOUNDS } from "@/lib/constants";
import { cn, getSoundLabel } from "@/lib/utils";
import useAudio from "@/hooks/use-audio";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { useSession } from "next-auth/react";
import { generateToken } from "@/lib/generate-token";
import { axiosClient } from "@/http/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { set } from "mongoose";

function NotificationForm() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSendingOpen, setIsSendingOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState("");
  const [selectedSendingSound, setSelectedSendingSound] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  const { data: session, update } = useSession();
  const { playSound } = useAudio();

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: IPayload) => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.post("/user/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Notification settings updated successfully");
      update();
      setIsNotificationOpen(false);
      setIsSendingOpen(false);
    },
  });
  const onPlaySound = (value: string) => {
    setSelectedSound(value);
    playSound(value);
  };
  return (
    <>
      <div className="flex items-center justify-between relative">
        <div className="flex flex-col">
          <p>Notification sound</p>
          <p className="text-muted-foreground text-xs">
            {getSoundLabel(session?.currentUser?.notificationSound)}
          </p>
        </div>

        <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <PopoverTrigger asChild>
            <Button size={"sm"}>
              Select <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 absolute -right-12">
            <div className="flex flex-col space-y-1">
              {SOUNDS.map((sound) => (
                <div
                  className={cn(
                    "flex justify-between items-center bg-secondary cursor-pointer hover:bg-primary-foreground",
                    selectedSound === sound.value && "bg-primary-foreground",
                  )}
                  key={sound.value}
                  onClick={() => onPlaySound(sound.value)}
                >
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    className="justify-start"
                  >
                    {sound.label}
                  </Button>
                  {session?.currentUser?.notificationSound == sound.value ? (
                    <Button size={"icon"}>
                      <Ghost />
                    </Button>
                  ) : (
                    <Button size={"icon"} variant={"ghost"}>
                      <PlayCircle />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              disabled={isPending}
              onClick={() =>
                mutate({
                  notificitionSound: selectedSound,
                })
              }
              className="w-full mt-2 font-bold"
            >
              Submit
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-between relative">
        <div className="flex flex-col">
          <p>Sending sound</p>
          <p className="text-muted-foreground text-xs">
            {getSoundLabel(session?.currentUser?.sendingSound)}
          </p>
        </div>

        <Popover open={isSendingOpen} onOpenChange={setIsSendingOpen}>
          <PopoverTrigger asChild>
            <Button size={"sm"}>
              Select <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 absolute -right-12">
            <div className="flex flex-col space-y-1">
              {SOUNDS.map((sound) => (
                <div
                  className={cn(
                    "flex justify-between items-center bg-secondary cursor-pointer hover:bg-primary-foreground",
                    selectedSendingSound === sound.value &&
                      "bg-primary-foreground",
                  )}
                  key={sound.value}
                  onClick={() => {
                    setSelectedSendingSound(sound.value);
                    playSound(sound.value);
                  }}
                >
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    className="justify-start"
                  >
                    {sound.label}
                  </Button>
                  {session?.currentUser?.notificationSound == sound.value ? (
                    <Button size={"icon"}>
                      <Ghost />
                    </Button>
                  ) : (
                    <Button size={"icon"} variant={"ghost"}>
                      <PlayCircle />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              disabled={isPending}
              onClick={() =>
                mutate({
                  sendingSound: selectedSound,
                })
              }
              className="w-full mt-2 font-bold"
            >
              Submit
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <Separator className="my-3" />
      <div className="flex items-center justify-between relative">
        <div className="flex flex-col">
          <p>Mode Mute</p>
          <p className="text-muted-foreground text-xs">
            {!session?.currentUser?.muted ? "Muted" : "Unmuted"}
          </p>
        </div>
        <Switch
          checked={!session?.currentUser?.muted}
          onCheckedChange={() =>
            mutate({ muted: !session?.currentUser?.muted })
          }
          disabled={isPending}
        />
      </div>
    </>
  );
}

export default NotificationForm;

interface IPayload {
  notificitionSound?: string;
  sendingSound?: string;
  muted?: boolean;
}
