import { Router } from "express";

import { SubscribeRequest } from "./newsletter-formats.js";
import { NewsletterSubscription } from "../../database/newsletter-db.js";
import Models from "../../database/models.js";
import { UpdateQuery } from "mongoose";
import { StatusCode } from "status-code-enum";
import { RouterError } from "../../middleware/error-handler.js";

const newsletterRouter: Router = Router();

/**
 * @api {post} /newsletter/subscribe/ POST /newsletter/subscribe/
 * @apiGroup Newsletter
 * @apiDescription Subscribe an email address to a newsletter. Will create a newsleter if it doesn't exist.
 *
 * @apiBody {String} listName Name of the list to add the user to
 * @apiBody {String} emailAddress Email address to add to the list
 * @apiParamExample {json} Example Request:
 * {"listName": "testingList", "emailAddress": "example@hackillinois.org" }
 *
 * @apiSuccess {String} status Status of the request
 * @apiSuccessExample Example Success Response:
 *     HTTP/1.1 200 OK
 *     {"status": "Succesful"}
 *
 * @apiError (400: Bad Request) {String} InvalidParams Invalid input passed in (missing name or email)
 * @apiError (400: Bad Request) {String} ListNotFound List doesn't exist within the database
 *
 * @apiErrorExample Example Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {"error": "InvalidParams"}
 */
newsletterRouter.post("/subscribe/", async (request, res, next) => {
    const requestBody: SubscribeRequest = request.body as SubscribeRequest;
    const listName: string | undefined = requestBody.listName;
    const emailAddress: string | undefined = requestBody.emailAddress;

    // Verify that both parameters do exist
    if (!listName || !emailAddress) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "InvalidParams"));
    }

    // Perform a lazy delete
    const updateQuery: UpdateQuery<NewsletterSubscription> = { $addToSet: { subscribers: emailAddress } };
    await Models.NewsletterSubscription.findOneAndUpdate({ newsletterId: listName }, updateQuery, { upsert: true });
    return res.status(StatusCode.SuccessOK).send({ status: "Success" });
});

export default newsletterRouter;
