import { oldEmailSchema, otpSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useMutation } from "@tanstack/react-query";
import { generateToken } from "@/lib/generate-token";
import { signOut, useSession } from "next-auth/react";
import { axiosClient } from "@/http/axios";
import { IError } from "@/types";
import { toast } from "sonner";

function EmailForm() {
  const [verify, setVerify] = useState(false);
  const { data: session } = useSession();

  const emailForm = useForm<z.infer<typeof oldEmailSchema>>({
    resolver: zodResolver(oldEmailSchema),
    defaultValues: {
      email: "",
      oldEmail: session?.currentUser?.email || "",
    },
  });
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
      email: "",
    },
  });

  const otpMutation = useMutation({
    mutationFn: async (email: string) => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.post<{ email: string }>(
        "/user/sent-otp",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: ({ email }) => {
      toast.success(`Otp sent to ${email}`);
      otpForm.setValue("email", email);
      setVerify(true);
    },
  });

  const onEmailSubmit = (values: z.infer<typeof oldEmailSchema>) => {
    otpMutation.mutate(values.email);
  };

  const verifyMutation = useMutation({
    mutationFn: async (otp: string) => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.put(
        "/user/email",
        { email: otpForm.getValues("email"), otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      toast.success(`Email updated successfully`);
      signOut();
    },
  });

  const onOtpSubmit = (values: z.infer<typeof otpSchema>) => {
    verifyMutation.mutate(values.otp);
  };

  return !verify ? (
    <Form {...emailForm}>
      <form
        className="space-y-2"
        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
      >
        <FormField
          control={emailForm.control}
          name="oldEmail"
          render={({ field }) => (
            <FormItem>
              <Label>Current email</Label>
              <FormControl>
                <Input className="h-10 bg-secondary" disabled {...field} />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label>Email</Label>
              <FormControl>
                <Input
                  disabled={otpMutation.isPending}
                  placeholder="asliddin@gmail.com"
                  className="h-10 bg-secondary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <Button
          disabled={otpMutation.isPending}
          type="submit"
          className="w-full"
        >
          Verify email
        </Button>
      </form>
    </Form>
  ) : (
    <Form {...otpForm}>
      <form className="space-y-2" onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
        <Label>New Email</Label>
        <Input
          className="h-10 bg-secondary"
          disabled
          value={emailForm.watch("email")}
        />
        <FormField
          control={otpForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <Label>OTP code</Label>
              <FormControl>
                <InputOTP
                  disabled={verifyMutation.isPending}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  className="w-full"
                  {...field}
                >
                  <InputOTPGroup className="w-full">
                    <InputOTPSlot
                      index={0}
                      className="w-full dark:bg-primary-foreground bg-secondary"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-full dark:bg-primary-foreground bg-secondary"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-full dark:bg-primary-foreground bg-secondary"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="w-full">
                    <InputOTPSlot
                      index={3}
                      className="w-full dark:bg-primary-foreground bg-secondary"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-full dark:bg-primary-foreground bg-secondary"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-full dark:bg-primary-foreground bg-secondary"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={verifyMutation.isPending}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}

export default EmailForm;
