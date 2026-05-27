import CartSyncDaemon from "./CartSyncDaemon";
import TableOrderSyncDaemon from "./TableOrderSyncDaemon";

export default function SyncDaemon() {
  return (
    <>
      <TableOrderSyncDaemon />
      <CartSyncDaemon />
    </>
  );
}
