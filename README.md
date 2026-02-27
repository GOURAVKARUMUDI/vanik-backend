# Second-Hand Books & Lab Equipment Marketplace API

## Setup Instructions

1.  **Install Dependencies**: `npm install`
2.  **Environment Variables**: Create a `.env` file based on `.env.example`.
3.  **Run Dev Server**: `npm run dev`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register new user | `{ name, email, password, college }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` |

### Products
| Method | Endpoint | Description | Body / Query |
| :--- | :--- | :--- | :--- |
| GET | `/api/products` | Get all products | Query: `category, type, minPrice, maxPrice, search` |
| GET | `/api/products/:id` | Get single product | - |
| POST | `/api/products` | Add product (Auth) | FormData: `title, description, category, type, price, image` |
| PUT | `/api/products/:id` | Update product (Owner) | FormData: `...fields` |
| DELETE| `/api/products/:id` | Delete product (Owner) | - |

### Orders
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| POST | `/api/orders` | Create order | `{ product, type, rentalStartDate, rentalEndDate, totalPrice }` |
| GET | `/api/orders/my` | My order history | - |
| PUT | `/api/orders/:id/status`| Update status | `{ status }` |

### Reviews
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| POST | `/api/reviews` | Add review | `{ orderId, rating, comment }` |
| GET | `/api/reviews/seller/:id`| Seller reviews | - |

### Admin
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/users` | All users | - |
| DELETE| `/api/admin/users/:id` | Delete user | - |
| PUT | `/api/admin/products/:id/status`| Product status | `{ status }` |
| GET | `/api/admin/stats` | System statistics | - |

## Socket.io Events
- **join_room**: data = `roomId` (usually `senderId_receiverId` sorted)
- **send_message**: data = `{ sender, receiver, content, room }`
- **receive_message**: data = `{ sender, receiver, content, room }`
