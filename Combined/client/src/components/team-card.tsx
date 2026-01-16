import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { IconArrowRight, IconUsersGroup } from "@tabler/icons-react";

interface TeamProps {
    teamName: string;
    classCode: string;
    description: string;
}

export function CreateTeamModal(props: TeamProps) {
    return (
        <Card className="min-w-80 min-h-20 max-w-80">
            <CardHeader className="gap-3 flex flex-row">
                <IconUsersGroup size={24} /> <b>{props.teamName}</b>
            </CardHeader>
            <hr></hr>
            <CardBody className="font-extralight">
                <div>{props.description}</div>
            </CardBody>
            <CardFooter className="justify-between">
                <div className="font-thin text-sm">
                    Class Code: {props.classCode}{" "}
                </div>
                <div className="">
                    <Button
                        startContent={<IconArrowRight />}
                        radius="full"
                        variant="bordered"
                        className="bg-secondary text-foreground rounded-md p-1"
                    ></Button>
                </div>
            </CardFooter>
        </Card>
    );
}
