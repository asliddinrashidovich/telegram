import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { axiosClient } from "@/http/axios";
import { emailSchema } from "@/lib/validation";
import { IError } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z, { set } from "zod";

function SignIn() {
  const { setStep, setEmail } = useAuth();

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axiosClient.post("/auth/login", { email });
      return data;
    },
    onSuccess: (res) => {
	  console.log("res email", res);
      setEmail(res.email);
      setStep("verify");
      toast.success("Verification code sent to your email");
    },
  });

  function onSubmit(values: z.infer<typeof emailSchema>) {
    mutate(values.email);
  }
  return (
    <div className="w-full">
      <p className="text-center text-sm text-muted mb-4">
        Telegram is a messanging app with a focus on speed and .security it's
        super fast and simple free
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label>Email</Label>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="name@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full cursor-pointer"
            size="lg"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default SignIn;
