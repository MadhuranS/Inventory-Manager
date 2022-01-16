const needle = require("needle");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
jest.setTimeout(20000);
describe("test for successful, creation, read, update and delete of an item", () => {
    let postRes;
    let patchRes;
    let getRes;
    let deleteRes;
    const data = {
        image: {
            file: path.resolve(__dirname, "../") + "/uploads/test.jpeg",
            content_type: "image/png",
        },
        name: "test",
        description: "test description",
        quantity: 10,
    };

    const patchData = {
        image: {
            file: path.resolve(__dirname, "../") + "/uploads/test2.jpeg",
            content_type: "image/png",
        },
        name: "test2",
        description: "test description",
    };
    beforeAll(async () => {
        postRes = await needle("post", `localhost:${PORT}/api/items`, data, {
            multipart: true,
        });

        patchRes = await needle(
            "patch",
            `localhost:${PORT}/api/items/${postRes.body._id}`,
            patchData,
            {
                multipart: true,
            }
        );

        getRes = await needle(
            "get",
            `localhost:${PORT}/api/items/${postRes.body._id}`
        );

        deleteRes = await needle(
            "delete",
            `localhost:${PORT}/api/items/${postRes.body._id}`
        );
    });
    describe("test for successful creation", () => {
        test("test for successful response", () => {
            expect(postRes.statusCode).toBe(200);
            expect(postRes.body).toBeDefined();
        });
        test("test for successful thumbnail creation", () => {
            expect(postRes.body.thumbnail).toBeDefined();
        });
        test("test for correct text fields", () => {
            expect(postRes.body.name).toBe(data.name);
            expect(postRes.body.description).toBe(data.description);
            expect(postRes.body.quantity).toBe(data.quantity);
        });
    });
    describe("test for successful update", () => {
        test("test for successful response", () => {
            expect(patchRes.statusCode).toBe(200);
            expect(patchRes.body).toBeDefined();
        });
        test("test for successful thumbnail update", () => {
            expect(patchRes.body.fileUpdates).toBe(true);
        });
        test("test for correct text field updates", () => {
            expect(patchRes.body.bodyUpdates).toEqual({
                name: patchData.name,
                description: patchData.description,
            });
        });
    });
    describe("test for successful read", () => {
        test("test for successful response", () => {
            expect(getRes.statusCode).toBe(200);
            expect(getRes.body).toBeDefined();
        });
        test("test for successful thumbnail read", () => {
            expect(getRes.body.thumbnail).toBeDefined();
        });
        test("test for correct text fields read", () => {
            expect(getRes.body.name).toBe(patchData.name);
            expect(getRes.body.description).toBe(patchData.description);
            expect(getRes.body.quantity).toBe(data.quantity);
        });
    });
    describe("test for successful delete", () => {
        test("test for successful response", () => {
            expect(deleteRes.statusCode).toBe(200);
            expect(deleteRes.body).toBeDefined();
        });
    });
});
