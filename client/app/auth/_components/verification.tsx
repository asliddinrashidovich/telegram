import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { axiosClient } from "@/http/axios";
import { otpSchema } from "@/lib/validation";
import { IError, Iuser } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { signIn } from "next-auth/react";

function Verification() {
  const { email } = useAuth();
  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: email || "",
      otp: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (otp: string) => {
      const { data } = await axiosClient.post<{user: Iuser}>("/auth/verify", { otp });
      return data;
    },
    onSuccess: ({user}) => {
      signIn("credentials", {email: user.email, callbackUrl: "/"})
      toast.success("Your email has been verified successfully");
    },
    onError: (error: IError) => {
      if (error.response?.data?.message) {
        return toast.error(error.response.data.message);
      }
      return toast.error("Something went wrong");
    },
  });

  function onSubmit(values: z.infer<typeof otpSchema>) {
    mutate(values.otp);
  }
  return (
    <div className="w-full">
      <p className="text-center text-sm text-muted mb-2">
        We have send a code to your email, Please check your email inpox
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            disabled={true}
            render={({ field }) => (
              <FormItem>
                <Label>Username</Label>
                <FormControl>
                  <Input disabled placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <Label>OTP code</Label>
                <FormControl>
                  <InputOTP
                    disabled={isPending}
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
          <Button disabled={isPending} type="submit" className="w-full cursor-pointer" size="lg">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Verification;
