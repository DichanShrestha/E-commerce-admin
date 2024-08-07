import Header from "@/components/Header";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("@/components/Chart"), { ssr: false });
export default function Home() {
  const inventory = [
    {
      text: "Total Revenue",
      image: "savings",
      number: "Rs 369",
    },
    {
      text: "Sales",
      image: "indeterminate_check_box",
      number: "3",
    },
    {
      text: "Products in Stock",
      image: "inventory_2",
      number: "6",
    },
  ];
  return (
    <div>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <div>
        <Header
          name="Dashboard"
          isEnabled={false}
          desc="Overview of your store"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between mt-10 w-[650px] items-center mx-auto">
          {inventory.map((item) => (
            <div key={item.text}>
              <CardTemplate
                text={item.text}
                number={item.number}
                image={item.image}
              />
            </div>
          ))}
        </div>

        <div>
          <Chart className="mx-auto mt-10 w-[650px]" />
        </div>
      </div>
    </div>
  );
}

const CardTemplate = ({
  text,
  image,
  number,
}: {
  text: string;
  image: string;
  number: string;
}) => {
  return (
    <div className="flex border-[1px] border-gray-500 h-auto w-52 p-4 rounded-md flex-col">
      <div className="flex justify-between">
        {text} <span className="material-symbols-outlined">{image}</span>
      </div>
      <div>{number}</div>
    </div>
  );
};
