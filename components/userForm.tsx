import { Input } from "@/components/ui/customInput";
import { Label } from "@/components/ui/customLabel";
import { cn } from "@/lib/utils";

type UserFormProps = {
  first_name: string;
  last_name: string;
  age: number | null;
  onChange: (name: string, value: string | number | null) => void;
};

const UserForm: React.FC<UserFormProps> = ({
  first_name,
  last_name,
  age,
  onChange,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <LabelInputContainer>
          <Label htmlFor="firstname">First name</Label>
          <Input
            required
            id="firstname"
            name="fromNAME"
            placeholder="John"
            type="text"
            value={first_name}
            onChange={(e) => onChange("first_name", e.target.value)}
            className="w-full"
          />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="lastname">Last name</Label>
          <Input
            required
            id="lastname"
            placeholder="Doe"
            type="text"
            value={last_name}
            onChange={(e) => onChange("last_name", e.target.value)}
            className="w-full"
          />
        </LabelInputContainer>
      </div>
      <LabelInputContainer>
        <Label htmlFor="age">Age (13+)</Label>
        <Input
          required
          id="age"
          placeholder="This will be kept private"
          type="number"
          min={14}
          max={99}
          value={age ?? ""}
          onChange={(e) =>
            onChange(
              "age",
              e.target.value ? parseInt(e.target.value, 10) : null
            )
          }
          className="w-full"
        />
      </LabelInputContainer>
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

export default UserForm;
