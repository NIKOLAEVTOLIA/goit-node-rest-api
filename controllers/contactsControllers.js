import contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  updStatusSchema,
} from "../schemas/contactsSchemas.js";
import validateBody from "../helpers/validateBody.js";
import validID from "../middlewares/validID.js";

export const getAllContacts = [
  async (req, res, next) => {
    try {
      const userId = req.user._id;
      const contacts = await contactsService.listContacts(userId);

      res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  },
];

export const getOneContact = [
  validID,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const contact = await contactsService.getContactById(id, userId);
      if (!contact) {
        throw HttpError(404, "Not found");
      }
      res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  },
];

export const deleteContact = [
  validID,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const removedContact = await contactsService.removeContact(id, userId);
      if (!removedContact) {
        throw HttpError(404, "Not found");
      }

      res.status(200).json(removedContact);
    } catch (err) {
      next(err);
    }
  },
];

export const createContact = [
  validateBody(createContactSchema),
  async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { name, email, phone } = req.body;
      const newContact = await contactsService.addContact(
        name,
        email,
        phone,
        userId
      );
      res.status(201).json(newContact);
    } catch (err) {
      next(err);
    }
  },
];

export const updateContact = [
  validID,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      const userId = req.user._id;

      if (!name && !email && !phone) {
        throw HttpError(400, "Body must have at least one field");
      }

      const updFields = {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
      };

      const validationResult = updateContactSchema.validate(updFields);
      if (validationResult.error) {
        throw HttpError(400, validationResult.error.message);
      }

      const updatedContact = await contactsService.updateContact(
        id,
        updFields,
        userId
      );
      if (!updatedContact) {
        throw HttpError(404, "Not found");
      }

      res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  },
];

export const updateStatusContact = [
  validID,
  validateBody(updStatusSchema),
  async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const { favorite } = req.body;
      const userId = req.user._id;

      const updatedContact = await contactsService.updateContact(
        contactId,
        { favorite },
        userId
      );

      if (!updatedContact) {
        throw HttpError(404, "Not found");
      }

      res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  },
];
