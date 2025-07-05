import classNames from "classnames";
import React, { useState } from "react";
import { MdCheck } from "react-icons/md";
import { AddEmailCode } from "./add-email-code";
import { ConfirmProfile } from "./confirm-profile";
import { CompleteCode } from "./complete-code";
import { useQuery } from "@tanstack/react-query";
import { testApi } from "../../../api-requests/auth-connect";

const AuthScreen = () => {
  const [selected, setSelected] = useState<number>(0);

  const { isPending, error, data } = useQuery({
    queryKey: ["repoData-test-data"],
    queryFn: testApi,
  });

  return (
    <div className="min-h-[90vh] flex items-center justify-center">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl">Connect your Account</h2>
          <p className="text-sm text-gray-400">
            This application is for internal Antares team
          </p>
        </div>

        <p>DATA: {JSON.stringify(data)}</p>
        <p>ERROR: {JSON.stringify(error)}</p>
        <p>LOADING: {JSON.stringify(isPending)}</p>

        <div className="w-[400px] bg-overlay relative p-4 rounded-lg">
          <div className="p-2 bg-black absolute top-7 left-12 right-12" />
          <div className="flex flex-row justify-between items-center ">
            {[
              { title: "Add email", completed: true },
              { title: "Profile", completed: false },
              { title: "Add password", completed: false },
            ].map((item, index) => (
              <button
                key={index}
                className="z-10"
                onClick={() => setSelected(index)}
              >
                <div
                  className={classNames(
                    " w-10 h-10 mx-auto border-2  border-black rounded-full flex items-center justify-center text-white text-2xl",
                    {
                      "bg-green-400": item.completed,
                      "bg-gray-500": !item.completed,
                      "outline outline-offset-1": selected === index,
                    }
                  )}
                >
                  {item.completed ? <MdCheck /> : index + 1}
                </div>

                <span className="text-gray-300 text-xs">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {selected === 0 && (
          <AddEmailCode
            onBack={() => setSelected(0)}
            onNext={() => setSelected(1)}
            code="- - - - -"
            email=""
            onChangeCode={() => {}}
            onChangeEmail={() => {}}
            isLoading={false}
          />
        )}

        {selected === 1 && (
          <ConfirmProfile
            avatarUrl="https://avatar.iran.liara.run/public"
            branch="Antares House"
            email="janviermuhawenimana@gmail.com"
            names="Janvier Muhawenimana"
            onPrevious={() => setSelected(0)}
            onNext={() => setSelected(2)}
          />
        )}

        {selected === 2 && (
          <CompleteCode code="12312" onComplete={() => setSelected(3)} />
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
