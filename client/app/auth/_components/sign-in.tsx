import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { emailSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

function SignIn() {
  const {setStep, setEmail} = useAuth()

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof emailSchema>) {
    setStep("verify")
    setEmail(values.email)
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
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage  className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full cursor-pointer" size="lg">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

export default SignIn;
