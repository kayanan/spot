/*global payhere*/
import axios from "axios";
import { toast } from "react-toastify";

 
  
  const handlePayment = async ({ paymentDetails ,onComplete,hashUrl}) => {


    try {
      //Request backend to generate the hash value
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_APP_URL}${hashUrl}`,
        paymentDetails,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data);
        const { hash, merchant_id } = response.data;

        // Payment configuration
        const payment = {
          sandbox: true, // Use sandbox for testing
          merchant_id: merchant_id,
          return_url: paymentDetails.return_url,
          cancel_url: paymentDetails.cancel_url,
          notify_url: paymentDetails.notify_url,
          order_id: paymentDetails.order_id,
          items: paymentDetails.items,
          amount: paymentDetails.amount,
          currency: "LKR",
          first_name: paymentDetails.first_name,
          last_name: paymentDetails.last_name,
          email: paymentDetails.email,
          phone: paymentDetails.phone,
          address: paymentDetails.address,
          city: paymentDetails.city,
          country: paymentDetails.country,
          custom_1: paymentDetails.custom_1,
          custom_2: paymentDetails.custom_2,
          hash: hash,
        };
        
        //delete modifiedPayment.iframe;
        //console.log(modifiedPayment,"--------------------------------modifiedPayment--------------------------------");
        //Initialize PayHere payment
        // const redirectToPayHere = (paymentData) => {
        //   const form = document.createElement('form');
        //   form.method = 'POST';
        //   form.action = 'https://sandbox.payhere.lk/pay/checkout';

        //   Object.keys(paymentData).forEach(key => {
        //     const input = document.createElement('input');
        //     input.type = 'hidden';
        //     input.name = key;
        //     input.value = paymentData[key];
        //     form.appendChild(input);
        //   });

        //   document.body.appendChild(form);
        //   console.log(form,"-----------------------------form--------------------------------");
        //   form.submit();
        // };

        // redirectToPayHere(payment);
        payhere.startPayment(payment);
        // Payment completed. It can be a successful failure.
        payhere.onCompleted = function onCompleted(orderId) {
          console.log(orderId,"orderId");
        onComplete();
          // Note: validate the payment and show success or failure page to the customer
        };

       //Payment window closed
        payhere.onDismissed = function onDismissed() {
          toast.error("Payment cancelled");
         // navigate(paymentDetails.cancel_url);
        };

        // Error occurred
        payhere.onError = function onError(error) {
          console.log(error,"error");
          toast.error("Payment failed");
        };
      } else {
        toast.error("Failed to process payment");
        console.error("Failed to generate hash for payment.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("An error occurred:", error);
    }
  };
  export default handlePayment;

 