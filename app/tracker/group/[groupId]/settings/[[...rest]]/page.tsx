import { OrganizationProfile } from "@clerk/nextjs";
import React, { useEffect } from "react";

const SettingsPage = () => {
  return (
    <div className="mb-4 pb-4">
      <OrganizationProfile
        appearance={{
          elements: {
            rootBox: {
              boxShadow: "none",
              width: "100%",
            },
            card: {
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              width: "100%",
              maxHeight: "500px", // Set a maximum height for the card
              overflowY: "auto", // Allow vertical scrolling inside the card if content overflows
            },
          },
        }}
      />
    </div>
  );
};

export default SettingsPage;
