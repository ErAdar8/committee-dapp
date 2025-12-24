const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Campaign", function () {
  let accounts;
  let factory;
  let campaign;

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("CampaignFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();          // 👈 זה במקום deployed()

    const tx = await factory.connect(accounts[0]).createCampaign(100);
    await tx.wait();

    const campaigns = await factory.getDeployedCampaigns();
    const campaignAddress = campaigns[0];

    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = Campaign.attach(campaignAddress);
  });

  it("deploys a factory and a campaign", async () => {
    expect(ethers.isAddress(await factory.getAddress())).to.be.true;
    expect(ethers.isAddress(await campaign.getAddress())).to.be.true;
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.manager();
    expect(manager).to.equal(accounts[0].address);
  });

  it("does not count the same approver twice", async () => {
    const before = await campaign.approversCount();

    const tx1 = await campaign
      .connect(accounts[1])
      .contribute({ value: 200 });
    await tx1.wait();

    const afterFirst = await campaign.approversCount();

    const tx2 = await campaign
      .connect(accounts[1])
      .contribute({ value: 300 });
    await tx2.wait();

    const afterSecond = await campaign.approversCount();

    expect(afterFirst).to.equal(before + 1n);
    expect(afterSecond).to.equal(afterFirst);
  });

  it("reverts if contribution is below minimum", async () => {
    await expect(
      campaign.connect(accounts[1]).contribute({ value: 99 })
    ).to.be.revertedWith("Contribution too small");
  });

  it("approvers address equals true", async () => {
    const tx1 = await campaign
      .connect(accounts[1])
      .contribute({ value: 200 });
    await tx1.wait();

    const approverVALUE = await campaign.approvers(accounts[1]);
    expect(approverVALUE).to.equal(true);
  });

  it("allows manager create a request", async () => {
    const tx = await campaign
      .connect(accounts[0])
      .createRequest("buying buttries", 200, accounts[5].address);
    await tx.wait();

    const request = await campaign.requests(0);

    expect(request.description).to.equal("buying buttries");
    expect(request.value).to.equal(200);
    expect(request.recipient).to.equal(accounts[5].address);
  });

  it("does not allow non-manager to create a request", async () => {
    await expect(
      campaign
        .connect(accounts[1])
        .createRequest("buying buttries", 200, accounts[5].address)
    ).to.be.revertedWith("Only manager can call this");
  });

  it("push request works properly", async () => {
    const tx = await campaign
      .connect(accounts[0])
      .createRequest("buying buttries", 200, accounts[5].address);
    await tx.wait();

    const tx2 = await campaign
      .connect(accounts[0])
      .createRequest("buying gummy", 400, accounts[6].address);
    await tx2.wait();

    const request = await campaign.requests(0);
    const request2 = await campaign.requests(1);

    expect(request.description).to.equal("buying buttries");
    expect(request.value).to.equal(200);
    expect(request.recipient).to.equal(accounts[5].address);

    expect(request.description).not.to.equal(request2.description);
    expect(request2.description).to.equal("buying gummy");
    expect(request2.recipient).to.equal(accounts[6].address);
  });

  it("approve request", async () => {
    const tx1 = await campaign
      .connect(accounts[1])
      .contribute({ value: 200 });
    await tx1.wait();

    const tx2 = await campaign
      .connect(accounts[0])
      .createRequest("buying buttries", 199, accounts[5].address);
    await tx2.wait();

    const requestBefore = await campaign.requests(0);
    const before = requestBefore.approvalCount;

    await campaign.connect(accounts[1]).approveRequest(0);

    const requestAfter = await campaign.requests(0);
    const after = requestAfter.approvalCount;

    expect(after).to.equal(before + 1n);

    await expect(
      campaign.connect(accounts[3]).approveRequest(0)
    ).to.be.revertedWith("Not an approver");

    await expect(
      campaign.connect(accounts[1]).approveRequest(0)
    ).to.be.revertedWith("Already approved");
  });

  it("finalize request works", async () => {
    const tx = await campaign
      .connect(accounts[1])
      .contribute({ value: 200 });
    await tx.wait();
    const tx1 = await campaign
      .connect(accounts[2])
      .contribute({ value: 200 });
    await tx1.wait();
    const tx2 = await campaign
      .connect(accounts[3])
      .contribute({ value: 200 });
    await tx2.wait();

    const txreq = await campaign
      .connect(accounts[0])
      .createRequest("buying buttries", 199, accounts[5].address);
    await txreq.wait();

    const txx = await campaign.connect(accounts[1]).approveRequest(0);
    const txx1 = await campaign.connect(accounts[2]).approveRequest(0);
    await txx.wait();
    await txx1.wait();

    const recipentbalanceb4 = await ethers.provider.getBalance(
      accounts[5].address
    );

    const txapprove = await campaign
      .connect(accounts[0])
      .finalizeRequest(0);
    await txapprove.wait();

    const recipentbalanceafter = await ethers.provider.getBalance(
      accounts[5].address
    );

    const req = await campaign.requests(0);
    const com = req.complete;

    expect(com).to.be.true;
    expect(recipentbalanceafter).to.equal(recipentbalanceb4 + 199n);
  });

  it("finalize request restricted", async () => {
    const tx = await campaign
      .connect(accounts[1])
      .contribute({ value: 200 });
    await tx.wait();
    const tx1 = await campaign
      .connect(accounts[2])
      .contribute({ value: 200 });
    await tx1.wait();
    const tx2 = await campaign
      .connect(accounts[3])
      .contribute({ value: 200 });
    await tx2.wait();

    const txreq = await campaign
      .connect(accounts[0])
      .createRequest("buying buttries", 199, accounts[5].address);
    await txreq.wait();

    const txx = await campaign.connect(accounts[1]).approveRequest(0);
    const txx1 = await campaign.connect(accounts[2]).approveRequest(0);
    await txx.wait();
    await txx1.wait();

    await expect(
      campaign.connect(accounts[1]).finalizeRequest(0)
    ).to.be.revertedWith("Only manager can call this");

    const txapprove = await campaign
      .connect(accounts[0])
      .finalizeRequest(0);
    await txapprove.wait();

    await expect(
      campaign.connect(accounts[0]).finalizeRequest(0)
    ).to.be.revertedWith("Request already completed");
  });

  it("finalize request only with majority", async () => {
    const tx = await campaign
      .connect(accounts[1])
      .contribute({ value: 200 });
    await tx.wait();
    const tx1 = await campaign
      .connect(accounts[2])
      .contribute({ value: 200 });
    await tx1.wait();
    const tx2 = await campaign
      .connect(accounts[3])
      .contribute({ value: 200 });
    await tx2.wait();

    const txreq = await campaign
      .connect(accounts[0])
      .createRequest("buying buttries", 199, accounts[5].address);
    await txreq.wait();

    const txx = await campaign.connect(accounts[1]).approveRequest(0);
    await txx.wait();

    await expect(
      campaign.connect(accounts[0]).finalizeRequest(0)
    ).to.be.revertedWith("Not enough approvals");
  });
});
