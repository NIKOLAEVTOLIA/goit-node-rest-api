import contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  updStatusSchema,
} from "../schemas/contactsSchemas.js";
import validateBody from "../helpers/validateBody.js";
import validID from "../middlewares/validID.js";
import authenticate from "../middlewares/authenticate.js";

export const getAllContacts = [
  authenticate,
  async (req, res, next) => {
    try {
      const contacts = await contactsService.listContacts(req.user._id);
      res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  },
];

export const getOneContact = [
  authenticate,
  validID,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const contact = await contactsService.getContactById(id);
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
  authenticate,
  validID,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const removedContact = await contactsService.removeContact(id);
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
  authenticate,
  validateBody(createContactSchema),
  async (req, res, next) => {
    try {
      const { name, email, phone } = req.body;
      const newContact = await contactsService.addContact(
        name,
        email,
        phone,
        req.user._id
      );
      res.status(201).json(newContact);
    } catch (err) {
      next(err);
    }
  },
];

export const updateContact = [
  authenticate,
  validID,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      if (!name && !email && !phone) {
        throw HttpError(400, "Body must have at least one field");
      }

      const currentContact = await contactsService.getContactById(id);

      if (!currentContact) {
        throw HttpError(404, "Not found");
      }

      const updFields = {
        name: name || currentContact.name,
        email: email || currentContact.email,
        phone: phone || currentContact.phone,
      };

      const validationResult = updateContactSchema.validate(updFields);
      if (validationResult.error) {
        throw HttpError(400, validationResult.error.message);
      }

      const updatedContact = await contactsService.updateContact(id, updFields);
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
  authenticate,
  validID,
  validateBody(updStatusSchema),
  async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const { favorite } = req.body;

      const updatedContact = await contactsService.updateContact(contactId, {
        favorite,
      });

      if (!updatedContact) {
        throw HttpError(404, "Not found");
      }

      res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  },
];
