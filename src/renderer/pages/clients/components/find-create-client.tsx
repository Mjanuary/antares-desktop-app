import React, { FunctionComponent, useState, ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FaUser, FaUserCircle, FaUserSlash } from "react-icons/fa";
import { MdOutlineRefresh } from "react-icons/md";

import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { CreateClientForm } from "./create-client";
import { Button } from "../../../components/double-button";

export const FindCreateClient: FunctionComponent<{
  onSelectClient: (client: {
    names: string;
    phone_number: string;
    id: string;
  }) => void;
  onChangeName: (name: string) => void;
  onClear: () => void;
  clientName: string;
  clientId: string | null;
  disabled?: boolean;
  error?: string;
  label?: string | ReactNode;
}> = ({
  onSelectClient,
  onChangeName,
  onClear,
  clientName,
  clientId,
  disabled,
  error,
  label,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [findClient, setFindClient] = useState(false);

  return (
    <>
      <div className="flex items-end">
        <div>
          <span className="mb-1 block text-sm text-base-color whitespace-nowrap w-fit">
            {label}
          </span>
          <Input
            value={clientName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Client name"
            className="w-full"
            disabled={disabled || !!clientId}
            error={error}
            containerClassName="flex-1"
            title="Client name"
          />
        </div>

        {!!clientId ? (
          <button onClick={() => onClear()} className="p-1">
            <FaUserSlash className="text-2xl" />
          </button>
        ) : (
          <button onClick={() => setFindClient(true)} className="p-1">
            <FaUserCircle className="text-2xl" />
          </button>
        )}
      </div>

      {findClient && (
        <Modal title="Find client" onClose={() => setFindClient(false)}>
          <FindClientForm
            onSuccess={(data) => {
              console.log({ client: data });
              setFindClient(false);
              onSelectClient({
                id: data.id,
                names: data.names,
                phone_number: data.phone_number,
              });
            }}
            onClose={() => setFindClient(false)}
            onCreateClient={() => {
              setFindClient(false);
              setShowCreateForm(true);
            }}
          />
        </Modal>
      )}

      {showCreateForm && (
        <Modal title="Create client" onClose={() => setShowCreateForm(false)}>
          <CreateClientForm
            onSuccess={(data) => {
              setShowCreateForm(false);
              onSelectClient({
                id: data.id,
                names: data.names,
                phone_number: data.phone_number,
              });
            }}
            onClose={() => setShowCreateForm(false)}
          />
        </Modal>
      )}
    </>
  );
};

const FindClientForm: FunctionComponent<{
  onSuccess: (client: {
    names: string;
    phone_number: string;
    id: string;
  }) => void;
  onClose: () => void;
  onCreateClient: () => void;
}> = ({ onSuccess, onClose, onCreateClient }) => {
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["search-clients", search],
    queryFn: () =>
      window.electronAPI.getClients(1, 30, search, {
        sortBy: "created_date DESC",
        dateFrom: "",
        dateTo: "",
      }),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <div className="flex gap-2 items-center mb-2 p-2 border-b border-gray-500">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client"
          className="flex-1"
          containerClassName="flex-1"
        />
        <Button onClick={() => refetch()} size="icon" variant="secondary">
          <MdOutlineRefresh />
        </Button>
        <Button onClick={onCreateClient} variant="primary">
          Create Client
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        {loading && <p>Loading...</p>}
        {data?.data.map((client) => (
          <div
            key={client.id}
            className="flex p-2 items-center gap-2 border rounded-lg border-gray-500"
          >
            <div>
              <FaUser className="text-2xl" />
            </div>
            <div className="flex-1">
              <p>{client.names}</p>
              <p>{client.phone_number}</p>
            </div>
            <div>
              <Button
                onClick={() =>
                  onSuccess({
                    id: client.id,
                    names: client.names,
                    phone_number: client.phone_number,
                  })
                }
                variant="primary-light"
              >
                Select
              </Button>
            </div>
          </div>
        ))}

        {data?.data.length === 0 && (
          <div className="flex items-center flex-col gap-2 justify-center">
            <p className="text-2xl">No clients found</p>
            <p>Try searching for a client or create a new one</p>
            <Button onClick={onCreateClient} variant="primary-light">
              Create Client
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
