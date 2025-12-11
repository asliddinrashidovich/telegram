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

function EmailForm() {
  const [verify, setVerify] = useState(false);

  const emailForm = useForm<z.infer<typeof oldEmailSchema>>({
    resolver: zodResolver(oldEmailSchema),
    defaultValues: {
      email: "",
      oldEmail: "asliddin@gmail.com",
    },
  });
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
      email: "",
    },
  });

  const onEmailSubmit = (values: z.infer<typeof oldEmailSchema>) => {
    console.log(values);
    emailForm.setValue("email", values.email);
    setVerify(true);
  };
  const onOtpSubmit = (values: z.infer<typeof otpSchema>) => {
    console.log(values);
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
                  placeholder="asliddin@gmail.com"
                  className="h-10 bg-secondary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
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

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}

export default EmailForm;
