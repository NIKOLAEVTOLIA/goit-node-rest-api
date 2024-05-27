import Contact from "../schemas/contactModel.js";

async function listContacts(ownerId) {
  try {
    return await Contact.find({ owner: ownerId });
  } catch (err) {
    throw err;
  }
}

async function getContactById(contactId, ownerId) {
  try {
    return await Contact.findOne({ _id: contactId, owner: ownerId });
  } catch (err) {
    throw err;
  }
}

async function removeContact(contactId, ownerId) {
  try {
    return await Contact.findOneAndDelete({ _id: contactId, owner: ownerId });
  } catch (err) {
    throw err;
  }
}

async function addContact(name, email, phone, ownerId) {
  try {
    const newContact = new Contact({ name, email, phone, owner: ownerId });
    return await newContact.save();
  } catch (err) {
    throw err;
  }
}

async function updateContact(contactId, updFields, ownerId) {
  try {
    return await Contact.findOneAndUpdate(
      { _id: contactId, owner: ownerId },
      updFields,
      { new: true }
    );
  } catch (err) {
    throw err;
  }
}

export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
