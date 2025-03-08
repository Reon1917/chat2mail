"use client"
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
    const handleSubmit = async (event) => {
      event.preventDefault();
      const form = event.target;
      const email = form.email.value;
      const password = form.password.value;
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      });
      if (result.error) {
        console.log(result.error);
        // Display error message
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" name="password" required />
        </div>
        <Button type="submit">Login</Button>
      </form>
    );
  }