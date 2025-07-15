import { Input } from "@/components/ui/customInput";
import { Label } from "@/components/ui/customLabel";
import { cn } from "@/lib/utils";

type EmailFormProps = {
  email: string;
  contact_method: string;
  usern: string;
  onChange: (name: string, value: string) => void;
};

const EmailForm: React.FC<EmailFormProps> = ({
  email,
  contact_method,
  usern,
  onChange,
}) => {
  return (
    <>
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-gray-100 text-center">
          Contact Details
        </h2>
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <LabelInputContainer>
            <Label htmlFor="email">Email</Label>
            <Input
              required
              id="email"
              placeholder="JohnDoe@example.com"
              type="email"
              name="emailFrom"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full"
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="contact">Contact method</Label>
            <Input
              required
              id="contact"
              placeholder="e.g. phone number.. discord username.."
              type="text"
              value={contact_method}
              onChange={(e) => onChange("contact_method", e.target.value)}
              className="w-full"
            />
          </LabelInputContainer>
        </div>{" "}
        <LabelInputContainer>
          <Label htmlFor="usern">Username</Label>
          <Input
            id="usern"
            placeholder="Your Cambright username "
            type="text"
            value={usern}
            onChange={(e) => onChange("usern", e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Adding your username means quicker approval!
          </p>
        </LabelInputContainer>
      </div>
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default EmailForm;
