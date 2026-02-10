import * as members from "@/views/members";

describe("views/members index", () => {
  it("re-exporta componentes principais", () => {
    expect(members.MembersCollectionPage).toBeTruthy();
    expect(members.MembersCard).toBeTruthy();
    expect(members.MembersPagination).toBeTruthy();
  });
});

