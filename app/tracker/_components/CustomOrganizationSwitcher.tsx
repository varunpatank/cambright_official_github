// "use client";

// import { useOrganizationList } from "@clerk/nextjs";
// import { FormEventHandler, useState } from "react";

// export default function CreateOrganization() {
//   const { createOrganization } = useOrganizationList();
//   const [organizationName, setOrganizationName] = useState("");

//   const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
//     e.preventDefault();

//     // Check if createOrganization is defined
//     if (createOrganization) {
//       createOrganization({ name: organizationName });
//     } else {
//       console.error("createOrganization is not defined");
//     }

//     setOrganizationName(""); // Clear the input field after submit
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         name="organizationName"
//         value={organizationName}
//         onChange={(e) => setOrganizationName(e.currentTarget.value)}
//       />
//       <button type="submit">Create organization</button>
//     </form>
//   );
// }
// "use client";

import { useOrganizationList } from "@clerk/nextjs";

export const CustomOrganizationSwitcher = () => {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  if (!isLoaded) {
    return <p>Loading</p>;
  }

  return (
    <>
      <h1>Custom Organization Switcher</h1>
      <ul>
        {userMemberships.data?.map((mem) => (
          <li key={mem.id}>
            <span>{mem.organization.name}</span>
            <button
              onClick={() => setActive({ organization: mem.organization.id })}
            >
              Select
            </button>
          </li>
        ))}
      </ul>

      <button
        disabled={!userMemberships.hasNextPage}
        onClick={() => userMemberships.fetchNext()}
      >
        Load more organizations
      </button>
    </>
  );
};
