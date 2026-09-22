import { purgeExpiredDrafts } from "../src/server/store";
console.info(
  JSON.stringify({
    event: "expired_drafts_purged",
    count: purgeExpiredDrafts(),
  }),
);
