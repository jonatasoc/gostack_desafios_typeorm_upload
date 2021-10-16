import * as CreateTransactionService from "./CreateTransactionService"
// @ponicode
describe("execute", () => {
    let inst: any

    beforeEach(() => {
        inst = new CreateTransactionService.default()
    })

    test("0", async () => {
        await inst.execute({ title: "Future Interactions Representative", value: 16, type: "outcome", category: "Home Loan Account" })
    })

    test("1", async () => {
        await inst.execute({ title: "Direct Functionality Orchestrator", value: 10, type: "outcome", category: "Home Loan Account" })
    })

    test("2", async () => {
        await inst.execute({ title: "Future Interactions Representative", value: 16, type: "income", category: "Home Loan Account" })
    })

    test("3", async () => {
        await inst.execute({ title: "Direct Functionality Orchestrator", value: 16, type: "income", category: "Investment Account" })
    })

    test("4", async () => {
        await inst.execute({ title: "Dynamic Quality Specialist", value: 256, type: "outcome", category: "Checking Account" })
    })

    test("5", async () => {
        await inst.execute({ title: "", value: -Infinity, type: "income", category: "" })
    })
})
