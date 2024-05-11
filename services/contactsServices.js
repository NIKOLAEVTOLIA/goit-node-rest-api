import Contact from "../schemas/contactModel.js";

async function listContacts() {
  try {
    return await Contact.find({});
  } catch (err) {
    throw err;
  }
}

async function getContactById(contactId) {
  try {
    return await Contact.findById(contactId);
  } catch (err) {
    throw err;
  }
}

async function removeContact(contactId) {
  try {
    return await Contact.findByIdAndDelete(contactId);
  } catch (err) {
    throw err;
  }
}

async function addContact(name, email, phone) {
  try {
    const newContact = new Contact({ name, email, phone });
    return await newContact.save();
  } catch (err) {
    throw err;
  }
}

async function updateContact(contactId, updFields) {
  try {
    return await Contact.findByIdAndUpdate(contactId, updFields, { new: true });
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
