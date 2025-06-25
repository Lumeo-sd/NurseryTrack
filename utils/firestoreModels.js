export const userModel = {
  uid: "",
  email: "",
  name: "",
  role: "worker" // or "admin"
};

export const varietyModel = {
  varietyId: "",
  name: "",
  latinName: "",
  defaultPhotoUrl: ""
};

export const batchModel = {
  batchId: "",
  varietyId: "",
  quantity: 0,
  status: "укорінення",
  containerSize: "",
  location: "",
  price: 0,
  dateRooted: null,
  dateAdded: null,
  notes: "",
  photos: [],
  qrCodeValue: ""
};

export const actionLogModel = {
  logId: "",
  batchId: "",
  userId: "",
  actionType: "",
  details: {},
  timestamp: null
};