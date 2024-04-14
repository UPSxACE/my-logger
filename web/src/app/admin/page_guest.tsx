// "use client";

// import ErrorAlert from "@/components/alerts/error-alert";
// import {
//   Button,
//   LoadingOverlay,
//   Paper,
//   PasswordInput,
//   TextInput,
// } from "@mantine/core";
// import { useForm } from "@mantine/form";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function AdminPageGuest() {
//   const [overlay, setOverlay] = useState(false);
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const form = useForm({
//     initialValues: {
//       identifier: "",
//       password: "",
//     },

//     validate: {},
//   });

//   async function handleLogin() {
//     if (overlay) return;
//     setOverlay(true);
//     axios
//       .post("http://localhost:1337/api/auth/local", form.values, {
//         withCredentials: true,
//       })
//       .then(() => {
//         // router.push("/app");
//         router.refresh();
//       })
//       .catch((err) => {
//         switch (err?.response?.status) {
//           case 404:
//             setError("The user does not exist.");
//             break;
//           case 400:
//             setError("Invalid username or password.");
//             break;
//           case 401:
//             setError("Invalid username or password.");
//             break;
//           default:
//             setError("Try again later.");
//         }
//         setOverlay(false);
//       });
//   }

//   return (
//     <main className="flex min-h-screen w-screen flex-col items-center justify-center">
//       <Paper
//         component="form"
//         bg="dark.8"
//         withBorder
//         className="relative min-w-[350px] max-w-[420px] px-5 py-4"
//         onSubmit={form.onSubmit(handleLogin)}
//       >
//         <LoadingOverlay
//           visible={overlay}
//           className="z-[99] rounded-md"
//           zIndex={99}
//           overlayProps={{ blur: 2 }}
//           loaderProps={{ type: "bars" }}
//         />
//         <h1 className="m-0 mb-2 text-center text-2xl">Admin Panel</h1>
//         <ErrorAlert title={error} visible={error != ""} />
//         <div className="flex flex-col gap-4">
//           <TextInput
//             required
//             label="Email"
//             placeholder="Your email"
//             value={form.values.identifier}
//             onChange={(event) =>
//               form.setFieldValue("identifier", event.currentTarget.value)
//             }
//             error={form.errors.identifier}
//             radius="md"
//           />

//           <PasswordInput
//             required
//             label="Password"
//             placeholder="Your password"
//             value={form.values.password}
//             onChange={(event) =>
//               form.setFieldValue("password", event.currentTarget.value)
//             }
//             error={form.errors.password}
//             radius="md"
//           />

//           <div className="flex">
//             <Button type="submit" color="mainColor.4" className="ml-auto">
//               Login
//             </Button>
//           </div>
//         </div>
//       </Paper>
//     </main>
//   );
// }
