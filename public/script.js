document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form"),
        nextBtns = form ? form.querySelectorAll(".nextBtn") : [],
        backBtns = form ? form.querySelectorAll(".backBtn") : [],
        allInputsFirst = form ? form.querySelectorAll(".first input") : [],
        allInputsSecond = form ? form.querySelectorAll(".second .details.product input") : [],
        errorMessage = document.getElementById("error-message"),
        formFirst = form ? form.querySelector(".form.first") : null,
        formSecond = form ? form.querySelector(".form.second") : null,
        productDetails = formSecond ? formSecond.querySelector(".details.product") : null,
        resourceDetails = formSecond ? formSecond.querySelector(".details.resource") : null;

    if (form) {
        nextBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                let allValid = true;
                let inputsToValidate = btn.closest(".form").classList.contains("first")
                    ? allInputsFirst
                    : allInputsSecond;

                inputsToValidate.forEach((input) => {
                    if (input.value === "") {
                        input.classList.add("error");
                        allValid = false;
                    } else {
                        input.classList.remove("error");
                    }
                });

                if (allValid) {
                    if (btn.closest(".form").classList.contains("first")) {
                        if (formFirst && formSecond) {
                            formFirst.classList.remove("active");
                            setTimeout(() => {
                                formFirst.style.display = "none";
                                formSecond.style.display = "block";
                                setTimeout(() => formSecond.classList.add("active"), 20);
                            }, 500);
                        }
                    } else if (btn.closest(".details").classList.contains("product")) {
                        if (productDetails && resourceDetails) {
                            productDetails.classList.remove("active");
                            setTimeout(() => {
                                productDetails.style.display = "none";
                                resourceDetails.style.display = "block";
                                setTimeout(() => resourceDetails.classList.add("active"), 20);
                            }, 500);
                        }
                    }
                    if (errorMessage) errorMessage.style.display = "none";
                } else {
                    if (errorMessage) errorMessage.style.display = "block";
                }
            });
        });

        backBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                if (btn.closest(".details").classList.contains("resource")) {
                    if (resourceDetails && productDetails) {
                        resourceDetails.classList.remove("active");
                        setTimeout(() => {
                            resourceDetails.style.display = "none";
                            productDetails.style.display = "block";
                            setTimeout(() => productDetails.classList.add("active"), 20);
                        }, 500);
                    }
                } else if (btn.closest(".details").classList.contains("product")) {
                    if (formSecond && formFirst) {
                        formSecond.classList.remove("active");
                        setTimeout(() => {
                            formSecond.style.display = "none";
                            formFirst.style.display = "block";
                            setTimeout(() => formFirst.classList.add("active"), 20);
                        }, 500);
                    }
                }
            });
        });
    }

    // Function to adjust the width of the input fields based on their content
    function adjustInputWidth(input) {
        const tmp = document.createElement('span');
        tmp.style.visibility = 'hidden';
        tmp.style.position = 'absolute';
        tmp.style.whiteSpace = 'nowrap'; // Prevent wrapping
        tmp.style.fontSize = getComputedStyle(input).fontSize;
        tmp.style.fontWeight = getComputedStyle(input).fontWeight;
        tmp.style.fontFamily = getComputedStyle(input).fontFamily;
        tmp.textContent = input.value || input.placeholder; // Use placeholder if value is empty
        document.body.appendChild(tmp);
        const width = tmp.getBoundingClientRect().width + 10; // Add some padding
        document.body.removeChild(tmp);
        input.style.width = `${width}px`;
    }

    // Adjust the width of all input fields on page load
    const labelInputs = document.querySelectorAll('.label input');
    if (labelInputs) {
        labelInputs.forEach(input => {
            adjustInputWidth(input);
            input.addEventListener('input', () => adjustInputWidth(input));
        });
    }

    // Venn Diagram Circle Interactions
    const circle1 = document.querySelector('.circle1');
    const circle2 = document.querySelector('.circle2');
    const circle3 = document.querySelector('.circle3');

    if (circle1) {
        circle1.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'pink';
        });
        circle1.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        });
    }

    if (circle2) {
        circle2.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'lightblue';
        });
        circle2.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
        });
    }

    if (circle3) {
        circle3.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'lightgreen';
        });
        circle3.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        });
    }
});
