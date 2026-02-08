import { Input } from "../../../components/ui/input";

export const BalanceInfo = () => (
  <div className="p-4">
    <h3 className="text-xl pb-2">Balance</h3>
    {/* <p className="text-sm pb-2 text-base-color">
        <b>1293Fc</b> is remaining as balance, Please add the balance below
      </p> */}
    {/* <button className="py-2 w-full text-left border px-4 items-center rounded mb-2 border-color-theme flex justify-between">
        <div>
          <span className="text-base-color">Other found balance</span>
          <h4 className="text-2xl font-bold">$0</h4>
        </div>
        <MdOpenInNew className="text-3xl text-base-color" />
      </button> */}

    <div className="p-4 border border-color-theme rounded">
      <div className="flex items-end gap-2 pb-2">
        <div className="flex-1">
          <span className="text-base-color">Current balance</span>
          <div>
            <Input value={0} />
          </div>
        </div>
        {/* <div className="flex items-end gap-2 ">
            <Button size="lg" variant="secondary">
              Ignore balance
            </Button>
          </div> */}
      </div>

      <Input type="date" label="Payment date" />
    </div>
  </div>
);
