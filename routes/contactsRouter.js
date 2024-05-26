import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} from "../controllers/contactsControllers.js";
import authenticate from "../middlewares/authenticate.js";

const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get("/", getAllContacts);
contactsRouter.get("/:id", getOneContact);
contactsRouter.delete("/:id", deleteContact);
contactsRouter.post("/", createContact);
contactsRouter.put("/:id", updateContact);
contactsRouter.patch("/:contactId/favorite", updateStatusContact);

export default contactsRouter;
